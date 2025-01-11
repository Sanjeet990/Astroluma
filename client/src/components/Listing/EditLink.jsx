import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, reloadDashboardDataState, reloadFolderListingState, selectedImageState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceBack from '../NiceViews/NiceBack';
import NiceForm from '../NiceViews/NiceForm';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceUploader from '../NiceViews/NiceUploader';
import makeToast from '../../utils/ToastUtils';
import NicePreferenceHeader from '../NiceViews/NicePreferenceHeader';
import AppConfigurator from '../Integration/AppConfigurator';

const EditLink = () => {
    const params = useParams();
    const listingId = params?.listingid;
    const parentId = params?.parentid;
    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);
    const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);
    const setFolderReloadStatus = useSetRecoilState(reloadFolderListingState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);

    const [linkName, setLinkName] = useState("");
    const [linkURL, setLinkURL] = useState("");
    const [localUrl, setLocalUrl] = useState("");
    const [showInSidebar, setShowInSidebar] = useState(false);
    const [showOnFeatured, setShowOnFeatured] = useState(!parentId ? true : false);
    const [disabledFeatured, setDisabledFeatured] = useState(!parentId ? true : false);
    const [integrationList, setIntegrationList] = useState([]);
    const [pageList, setPageList] = useState([]);
    const [haveRemoteUrl, setHaveRemoteUrl] = useState(false);
    const [selectedPage, setSelectedPage] = useState("");
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [integrationConfig, setIntegrationConfig] = useState({});
    const [connectionStatus, setConnectionStatus] = useState(null);

    useDynamicFilter(false);
    useCurrentRoute("/manage/listing");

    useEffect(() => {
        setSelectedImage({
            iconUrl: "link",
            iconUrlLight: null,
            iconProvider: 'com.astroluma.self'
        });
        setLoading(true);
        ApiService.get(`/api/v1/listing/link/${listingId}`, loginData?.token, navigate)
            .then(data => {
                setIntegrationList(data?.message?.integrations);
                if (data?.message?.listing) {
                    setLinkName(data?.message?.listing?.listingName || "");
                    setLinkURL(data?.message?.listing?.listingUrl || "");
                    setLocalUrl(data?.message?.listing?.localUrl || "");
                    setShowInSidebar(data?.message?.listing?.inSidebar);
                    setShowOnFeatured(data?.message?.listing?.onFeatured);
                    setDisabledFeatured(data?.message?.listing?.parentId ? false : true);

                    if (data?.message?.listing?.integration) {
                        const integration = data?.message?.integrations.find(app => app.appId === data?.message?.listing?.integration?.appId);
                        setSelectedIntegration(integration);
                        setIntegrationConfig(data?.message?.listing?.integration?.config);
                    }

                    if (data?.message?.listing?.listingIcon) {
                        setSelectedImage(data?.message?.listing?.listingIcon);
                    }

                    if (data?.message?.listing?.listingType !== "link") {
                        navigate("/manage/listing");
                    }

                    if (data?.message?.listing?.listingUrl) {
                        setHaveRemoteUrl(true);
                    }

                    if (data?.message?.listing?.listingUrl?.startsWith("/p/") && !data?.message?.listing?.localUrl) {
                        const pid = data?.message?.listing?.listingUrl?.split("/")[2];
                        if (data?.message?.pages?.find(page => page._id === pid)) {
                            setSelectedPage(pid);
                            setHaveRemoteUrl(false);
                        }
                    }
                } else {
                    setSelectedImage({
                        iconUrl: "link",
                        iconUrlLight: null,
                        iconProvider: 'com.astroluma.self'
                    });
                    setLinkName("");
                    setLinkURL("");
                    setLocalUrl("");
                    setShowInSidebar(false);
                    setShowOnFeatured(!parentId ? true : false);
                    setFolderReloadStatus(true);
                    setSelectedIntegration("");
                    setSelectedPage("");
                }

                setPageList(data?.message?.pages);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch link details.");
            }).finally(() => {
                setLoading(false);
            });
    }, [listingId, loginData?.token, navigate, setFolderReloadStatus, setLoading, setSelectedImage]);

    const handleFormSubmit = () => {
        let remoteUrl = linkURL;
        if (!haveRemoteUrl) remoteUrl = "";

        if (!linkName && !(remoteUrl || selectedPage || localUrl)) {
            makeToast("warning", "Please fill all the fields");
            return;
        }

        if (!selectedImage) {
            makeToast("warning", "You must have to select an icon");
            return;
        }

        if (selectedIntegration) {
            for (let field of selectedIntegration.config) {
                if (field.required && !integrationConfig[field.name]) {
                    makeToast("warning", `${field.label} is required`);
                    return;
                }
            }
        }

        const tempLink = selectedPage ? `/p/${selectedPage}` : (haveRemoteUrl ? remoteUrl : "");

        const postData = {
            listingId,
            parentId,
            linkName,
            linkIcon: selectedImage,
            linkURL: tempLink,
            localUrl,
            showInSidebar,
            showOnFeatured,
            integration: !selectedIntegration ? null : {
                package: selectedIntegration?.appId,
                config: integrationConfig
            }
        };

        setLoading(true);
        ApiService.post('/api/v1/listing/save/link', postData, loginData?.token, navigate)
            .then(() => {
                setSelectedImage(null);
                setLinkName("");
                setLinkURL("");
                setLocalUrl("");
                setShowInSidebar(false);
                setShowOnFeatured(false);
                setFolderReloadStatus(true);
                setSelectedIntegration("");
                setReloadData(true);
                makeToast("success", "Link saved.");
                navigate(-1);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Error saving link.");
            }).finally(() => {
                setLoading(false);
            });
    };

    const setPageSelection = (value) => {
        setSelectedPage(value);
        setLocalUrl("");
        setLinkURL("");
        setHaveRemoteUrl(false);
    };

    const configureApplication = (e) => {
        const selectedAppId = e.target.value;

        const selectedApp = integrationList.find(app => app.appId === selectedAppId);

        setSelectedIntegration(selectedApp);

        const initialFormData = {};
        if (selectedApp?.config) {
            selectedApp.config.forEach(field => {
                if (field.type === 'checkbox') {
                    initialFormData[field.name] = false;
                } else if (field.type === 'radio') {
                    initialFormData[field.name] = '';
                } else if (field.type === 'select') {
                    initialFormData[field.name] = field.options[0] || '';
                } else {
                    initialFormData[field.name] = '';
                }
            });
        }

        setIntegrationConfig(initialFormData);
    };

    const appConfigurationListener = (data) => {
        setIntegrationConfig(data);
    }

    const testConnectionListener = () => {
        setConnectionStatus(null);
        setLoading(true);

        const connectionData = {
            appId: selectedIntegration?.appId,
            localUrl,
            linkURL,
            config: integrationConfig
        };

        ApiService.post("/api/v1/app/test", connectionData, loginData?.token, navigate)
            .then(() => {
                setConnectionStatus({ status: 'success', message: "Connection successful." });
                makeToast("success", "Connection successful.");
            })
            .catch((error) => {
                if (!error.handled) {
                    console.error(error);
                    setConnectionStatus({
                        status: 'error',
                        message: typeof error?.response?.data === 'string'
                            ? error.response.data
                            : JSON.stringify(error?.response?.data) || "Connection failed."
                    });
                    makeToast("error", "Connection failed.");
                }
            }).finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <Helmet>
                <title>{!listingId ? "Add a new link" : "Edit a link"}</title>
            </Helmet>

            <Breadcrumb
                type="custom"
                pageTitle={!listingId ? "Add a new link" : "Edit a link"}
                breadcrumbList={[
                    { "id": "1", "linkName": "Settings", "linkUrl": "/manage" },
                    { "id": "2", "linkName": "Listing", "linkUrl": "/manage/listing" }
                ]}
            />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-4 sm:px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NicePreferenceHeader title={!listingId ? "Add a new link" : "Edit a link"} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <NiceInput
                                    label="Link Name"
                                    className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                    value={linkName}
                                    onChange={(e) => setLinkName(e.target.value)}
                                />
                            </div>
                            <div>
                                <NiceUploader
                                    label="Link Icon"
                                    selectedImage={selectedImage}
                                    placeholder="Select or upload icon"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {!selectedPage && (
                                <div className="col-span-1">
                                    <NiceInput
                                        label="Local URL"
                                        className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                        value={localUrl}
                                        onChange={(e) => {
                                            setLocalUrl(e.target.value);
                                            setSelectedPage("");
                                        }}
                                    />
                                </div>
                            )}

                            <div className={`col-span-1 ${selectedPage ? 'sm:col-span-2' : ''}`}>
                                <label className="block mb-2" htmlFor="selectPage">
                                    Select Page
                                </label>
                                <select
                                    className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                                    id="selectPage"
                                    value={selectedPage}
                                    onChange={(e) => setPageSelection(e.target.value)}
                                >
                                    <option value="">Select a page</option>
                                    {pageList?.map((page, index) => (
                                        <option key={index} value={page?._id}>{page.pageTitle}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {!selectedPage && (
                                <div>
                                    <NiceCheckbox
                                        label='Have Remote URL'
                                        checked={haveRemoteUrl}
                                        onChange={(e) => {
                                            setHaveRemoteUrl(e.target.checked);
                                            if (!e.target.checked) {
                                                setLinkURL("");
                                            }
                                        }}
                                    />
                                    {haveRemoteUrl && (
                                        <div className="mt-4">
                                            <NiceInput
                                                label="Link URL"
                                                className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                                value={linkURL}
                                                onChange={(e) => {
                                                    setLinkURL(e.target.value);
                                                    setSelectedPage("");
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={selectedPage ? 'sm:col-span-1' : ''}>
                                <label className="block mb-2" htmlFor="integrationApp">
                                    Visibility
                                </label>
                                <div className="space-y-2">
                                    {!parentId && (
                                        <NiceCheckbox
                                            label='Show on featured screen'
                                            checked={showOnFeatured}
                                            onChange={(e) => setShowOnFeatured(e.target.checked)}
                                        />
                                    )}
                                    <NiceCheckbox
                                        label='Show in sidebar'
                                        checked={showInSidebar}
                                        onChange={(e) => setShowInSidebar(e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <NicePreferenceHeader title="Application Integration (Optional)" />
                            <div className="w-full sm:w-1/2">
                                <label className="block mb-2" htmlFor="integrationApp">
                                    Select Application
                                </label>
                                <select
                                    className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                                    id="integrationApp"
                                    value={selectedIntegration?.appId}
                                    onChange={configureApplication}
                                >
                                    <option value="">None</option>
                                    {
                                        integrationList.map((integration, index) => (
                                            <option key={index} value={integration?.appId}>
                                                {integration.appName}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <AppConfigurator
                                application={selectedIntegration}
                                config={integrationConfig}
                                appConfigurationListener={appConfigurationListener}
                                connectionStatus={connectionStatus}
                                testConnectionListener={testConnectionListener}
                            />

                        </div>

                        <div className="flex justify-end mt-6">
                            <NiceBack />
                            <NiceButton
                                label="Save"
                                onClick={handleFormSubmit}
                                className="bg-buttonSuccess text-buttonText"
                            />
                        </div>
                    </NiceForm>
                </div>
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(EditLink);
export default MemoizedComponent;