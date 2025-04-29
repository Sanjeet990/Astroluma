import React, { useEffect, useState, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isHostModeState, loadingState, loginState, reloadDashboardDataState, selectedImageState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import makeToast from '../../utils/ToastUtils';
import NiceBack from '../NiceViews/NiceBack';
import NicePreferenceHeader from '../NiceViews/NicePreferenceHeader';
import { Helmet } from 'react-helmet';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import { useNavigate } from 'react-router-dom';
import NiceUploader from '../NiceViews/NiceUploader';

const GeneralSettings = () => {

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const setActiveRoute = useCurrentRoute();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);
    const isHostMode = useRecoilValue(isHostModeState);
    const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);

    const [siteName, setSiteName] = useState('');
    const [authenticator, setAuthenticator] = useState(false);
    const [camerafeed, setCamerafeed] = useState(false);
    const [todolist, setTodolist] = useState(false);
    const [linksalwaysnewtab, setLinksAlwaysNewTab] = useState(false);
    const [foldersalwaysnewtab, setFoldersAlwaysNewTab] = useState(false);
    const [snippetmanager, setSnippetManager] = useState(false);
    const [networkdevices, setNetworkdevices] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute("/manage/general");
    }, [setActiveRoute]);

    const saveSettings = () => {
        //validate data
        if (!siteName) {
            return makeToast("warning", "Site name is required");
        }

        if (!selectedImage?.image) {
            makeToast("warning", "You must have to select a site logo.");
            return;
        }

        //send data to save
        setLoading(true);
        ApiService.post("/api/v1/settings", { siteName, siteLogo: selectedImage?.image, authenticator, camerafeed, networkdevices, todolist, snippetmanager, linksalwaysnewtab, foldersalwaysnewtab }, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Details saved successfully.");
                setReloadData(true);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to save settings.");
            }).finally(() => {
                setLoading(false);
            });
    }

    //fetch the settings to prefill in form
    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/settings", loginData?.token, navigate)
            .then(data => {
                setSiteName(data?.message?.siteName);
                setAuthenticator(data?.message?.authenticator);
                setCamerafeed(data?.message?.camerafeed);
                setNetworkdevices(data?.message?.networkdevices);
                setTodolist(data?.message?.todolist);
                setLinksAlwaysNewTab(data?.message?.linksalwaysnewtab);
                setFoldersAlwaysNewTab(data?.message?.foldersalwaysnewtab);
                setSnippetManager(data?.message?.snippetmanager);

                if (data?.message?.siteLogo) {
                    setSelectedImage({ image: data?.message?.siteLogo });
                }
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch settings.");
            }).finally(() => {
                setLoading(false);
            });
    }, [loginData, setLoading, navigate, setSelectedImage]);

    const handleImportMigration = () => {
        setShowImportModal(true);
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "application/json") {
            makeToast("error", "Please select a valid JSON file");
            return;
        }

        const formData = new FormData();
        formData.append('migrationFile', file);

        setLoading(true);
        ApiService.postWithFormData("/api/v1/settings/import-migration", formData, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Migration data imported successfully! Please log in again.");
                setTimeout(() => {
                    navigate('/logout');
                }, 2000);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to import migration data.");
            }).finally(() => {
                setLoading(false);
                setShowImportModal(false);
            });
    }

    const triggerFileInput = () => {
        fileInputRef.current.click();
    }

    const closeImportModal = () => {
        setShowImportModal(false);
    }

    return (
        <>
            <Helmet>
                <title>General Settings</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"General Settings"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="max-w-4xl mx-auto w-full">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <div className="mt-4">

                        <NicePreferenceHeader
                            title="Appearance" />

                        <NiceInput
                            label="Site Name"
                            value={siteName}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="Enter site name"
                        />

                        <NiceUploader
                            label="Site Logo"
                            selectedImage={selectedImage?.image}
                            placeholder="Select or upload icon"
                        />

                        <NicePreferenceHeader
                            title="Features" />

                        <NiceCheckbox
                            label="Enable Todo List"
                            checked={todolist}
                            onChange={(e) => setTodolist(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable Snippet Manager"
                            checked={snippetmanager}
                            onChange={(e) => setSnippetManager(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable Stream Hub"
                            checked={camerafeed}
                            onChange={(e) => setCamerafeed(e.target.checked)}
                        />

                        <NiceCheckbox
                            label='Enable Network Device Scanning'
                            checked={networkdevices}
                            disabled={!isHostMode}
                            onChange={(e) => setNetworkdevices(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable TOTP Authenticator"
                            checked={authenticator}
                            onChange={(e) => setAuthenticator(e.target.checked)}
                        />


                        <NicePreferenceHeader
                            title="Behaviour" />

                        <NiceCheckbox
                            label="Always open links in new tab"
                            checked={linksalwaysnewtab}
                            onChange={(e) => setLinksAlwaysNewTab(e.target.checked)}
                        />
                        <NiceCheckbox
                            label="Always open folders in new tab"
                            checked={foldersalwaysnewtab}
                            onChange={(e) => setFoldersAlwaysNewTab(e.target.checked)}
                        />

                        <NicePreferenceHeader
                            title="Advanced Settings" />

                        <div className="flex items-center justify-between mb-4 mt-2">
                            <div>
                                <div className="text-sm font-medium">Import Migration Script</div>
                                <div className="text-xs text-bodyTextSecondary">Import data from a migration backup file</div>
                            </div>
                            <NiceButton
                                label="Import"
                                className="bg-buttonWarning text-buttonText"
                                onClick={handleImportMigration}
                            />
                        </div>

                    </div>
                    <div className="flex justify-end mt-4">
                        <NiceBack />

                        <NiceButton
                            label="Save"
                            className="bg-buttonSuccess text-buttonText"
                            onClick={saveSettings}
                        />

                    </div>
                </div>
            </div>

            {/* Import Migration Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-cardBg border border-cardBorder rounded-xl shadow-xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Import Migration Data</h2>
                        
                        <div className="bg-buttonDanger/10 border border-buttonDanger rounded-md p-4 mb-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <svg className="h-5 w-5 text-buttonDanger" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-buttonDanger">Warning</h3>
                                    <div className="mt-2 text-sm text-bodyText">
                                        <p>Importing migration data will <strong>permanently delete</strong> all your current data except for the default icon pack. This action cannot be undone.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mb-4 text-sm">Please select a valid JSON backup file to import. After import completes, you will be logged out and need to log in again with the credentials from the backup.</p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                className="px-4 py-2 bg-cardBg text-bodyText border border-cardBorder rounded hover:bg-bodyBg transition-colors"
                                onClick={closeImportModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-buttonWarning text-buttonText rounded hover:bg-opacity-90 transition-colors"
                                onClick={triggerFileInput}
                            >
                                Select File
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const MemoizedComponent = React.memo(GeneralSettings);
export default MemoizedComponent;
