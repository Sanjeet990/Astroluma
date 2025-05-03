import React, { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import NiceBack from '../NiceViews/NiceBack';
import { Helmet } from 'react-helmet';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import { useNavigate } from 'react-router-dom';

const ImportMigration = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const setActiveRoute = useCurrentRoute();
    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute("/manage/import");
    }, [setActiveRoute]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
            makeToast("error", "Please select a valid ZIP backup file");
            return;
        }

        const formData = new FormData();
        formData.append('migrationFile', file);

        setLoading(true);
        ApiService.postWithFormData("/api/v1/settings/import-migration", formData, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Backup imported successfully! Please log in again.");
                setTimeout(() => {
                    navigate('/logout');
                }, 2000);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to import backup data.");
            }).finally(() => {
                setLoading(false);
            });
    }

    const triggerFileInput = () => {
        fileInputRef.current.click();
    }

    return (
        <>
            <Helmet>
                <title>Import Migration</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"Import Migration"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="max-w-4xl mx-auto w-full">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-2xl font-bold mb-6">Import Migration Data</h2>
                    
                    <div className="bg-buttonDanger/10 border border-buttonDanger rounded-md p-4 mb-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <svg className="h-6 w-6 text-buttonDanger" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-buttonDanger">Warning: Data Loss Risk</h3>
                                <div className="mt-2 text-sm text-bodyText">
                                    <p className="mb-2">Importing migration data will <strong>permanently delete</strong> all your current data except for the default icon pack.</p>
                                    <p className="font-bold text-buttonDanger">This action cannot be undone.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-3">What will be imported?</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>User accounts and preferences</li>
                            <li>Listings, folders, and links</li>
                            <li>Todo items and code snippets</li>
                            <li>Custom pages and content</li>
                            <li>Network device configurations</li>
                            <li>TOTP authenticator data</li>
                            <li>Icon packs (except default)</li>
                            <li>Upload files from storage</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Make sure your backup file is a valid ZIP archive</li>
                            <li>Click the "Select Backup File" button below to choose your backup file</li>
                            <li>Wait for the import process to complete</li>
                            <li>You will be automatically logged out</li>
                            <li>Log back in using credentials from the imported backup</li>
                        </ol>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".zip" 
                        className="hidden" 
                    />

                    <div className="flex justify-between mt-8">
                        <NiceBack label="Go Back" />
                        
                        <NiceButton
                            label="Select Backup File"
                            className="bg-buttonWarning text-buttonText"
                            onClick={triggerFileInput}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(ImportMigration);
export default MemoizedComponent;