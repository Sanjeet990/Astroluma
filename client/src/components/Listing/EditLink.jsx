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
    const [integrationList, setIntegrationList] = useState([]);
    const [pageList, setPageList] = useState([]);
    const [selectedIntegration, setSelectedIntegration] = useState("");
    const [haveRemoteUrl, setHaveRemoteUrl] = useState(false);
    const [selectedPage, setSelectedPage] = useState("");

    useDynamicFilter(false);
    useCurrentRoute("/manage/listing");

    useEffect(() => {
        setLoading(true);
        ApiService.get(`/api/v1/listing/link/${listingId}`, loginData?.token)
            .then(data => {
                setIntegrationList(data?.message?.integrations);
                if (data?.message?.listing) {
                    setLinkName(data?.message?.listing?.listingName);
                    setLinkURL(data?.message?.listing?.listingUrl);
                    setLocalUrl(data?.message?.listing?.localUrl);
                    setShowInSidebar(data?.message?.listing?.inSidebar);
                    setShowOnFeatured(data?.message?.listing?.onFeatured);

                    setSelectedIntegration(data?.message?.listing?.integration || "");

                    if (data?.message?.listing?.listingIcon) {
                        setSelectedImage({ iconPath: data?.message?.listing?.listingIcon });
                    }

                    if (data?.message?.listing?.listingType !== "link") {
                        navigate("/manage/listing");
                    }

                    //if localURL is there then set the checkbox
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
                    setSelectedImage(null);
                    setLinkName("");
                    setLinkURL("");
                    setLocalUrl("");
                    setShowInSidebar(false);
                    setShowOnFeatured(false);
                    setFolderReloadStatus(true);
                    setSelectedIntegration("");
                    setSelectedPage("");
                }

                setPageList(data?.message?.pages);
            })
            .catch(() => {
                makeToast("error", "Failed to fetch link details.");
            }).finally(() => {
                setLoading(false);
            });
    }, [listingId, loginData?.token, navigate, setFolderReloadStatus, setLoading, setSelectedImage]);

    const handleFormSubmit = () => {

        let remoteUrl = linkURL;

        if (!haveRemoteUrl) remoteUrl = "";

        if (!linkName && !selectedImage?.iconPath && !(remoteUrl || selectedPage || localUrl)) {
            makeToast("warning", "Please fill all the fields");
            return;
        }

        //Call the API to store the data
        const iconPath = selectedImage ? selectedImage.iconPath : "link";

        const tempLink = selectedPage ? `/p/${selectedPage}` : (haveRemoteUrl ? remoteUrl : "");

        setLoading(true);
        ApiService.post('/api/v1/listing/save/link', { listingId, parentId, linkName, linkIcon: iconPath, linkURL: tempLink, localUrl, showInSidebar, showOnFeatured, integration: selectedIntegration }, loginData?.token)
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
            .catch(() => {
                makeToast("error", "Error saving link.");
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

    return (
        <>
            <Helmet>
                <title>{!listingId ? "Add a new link" : "Edit a link"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!listingId ? "Add a new link" : "Edit a link"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Listing", "linkUrl": "/manage/listing" }]} />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NiceInput
                            label="Link Name"
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                        />
                        <NiceUploader
                            label="Link Icon"
                            selectedImage={selectedImage}
                            placeholder="Select or upload icon"
                        />
                        {
                            !selectedPage &&
                            <NiceInput
                                label="Local URL"
                                className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                value={localUrl}
                                onChange={(e) => setLocalUrl(e.target.value)}
                            />
                        }
                        <div className="mb-4">
                            {
                                pageList?.length > 0 && <>
                                    <label className="block mt-4 mb-2" htmlFor="selectPage">
                                        {selectedPage ? "Selected Page" : "Or select from pages"}
                                    </label>
                                    <select
                                        className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                                        id="selectPage"
                                        value={selectedPage}
                                        onChange={(e) => setPageSelection(e.target.value)}
                                    >
                                        <option value="">Select a page</option>
                                        {
                                            pageList?.map((page, index) => {
                                                return (
                                                    <option key={index} value={page?._id}>{page.pageTitle}</option>
                                                );
                                            })
                                        }
                                    </select>
                                </>
                            }
                        </div>
                        {
                            !selectedPage && <NiceCheckbox
                                label='Have Remote URL'
                                checked={haveRemoteUrl}
                                onChange={(e) => setHaveRemoteUrl(e.target.checked)}
                            />
                        }

                        {
                            (!selectedPage && haveRemoteUrl) && <NiceInput
                                label="Link URL"
                                className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                value={linkURL}
                                onChange={(e) => setLinkURL(e.target.value)}
                            />
                        }


                        {
                            !selectedPage && <div className="mb-4">
                                <label className="block mb-2" htmlFor="integrationApp">
                                    Integration
                                </label>
                                <select
                                    className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                                    id="integrationApp"
                                    value={selectedIntegration}
                                    onChange={(e) => setSelectedIntegration(e.target.value)}
                                >
                                    <option value="">None</option>
                                    {
                                        integrationList.map((integration, index) => {
                                            return (
                                                <option key={index} value={integration?._id}>{integration.integrationName}</option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                        }

                        {
                            !parentId && <NiceCheckbox
                                label='Show on featured screen'
                                checked={showOnFeatured}
                                onChange={(e) => setShowOnFeatured(e.target.checked)}
                            />
                        }
                        <NiceCheckbox
                            label='Show in sidebar'
                            checked={showInSidebar}
                            onChange={(e) => setShowInSidebar(e.target.checked)}
                        />

                        <div className="flex justify-end">
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
