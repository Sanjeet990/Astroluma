import React, { useEffect, useState, useRef, useCallback } from 'react';
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, userDataState } from '../../atoms';
import { Helmet } from 'react-helmet';
import { GrAppsRounded } from "react-icons/gr";
import { FaSync, FaDownload  } from "react-icons/fa";
import SingleHostedApp from './SingleHostedApp';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';
import semver from 'semver';

const InstallApps = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const observerRef = useRef(null);
    const setLoading = useSetRecoilState(loadingState);
    const [appList, setAppList] = useState([]);
    const [installedApps, setInstalledApps] = useState(new Map());
    //const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loginData = useRecoilValue(loginState);

    const userData = useRecoilValue(userDataState);

    useDynamicFilter(false);
    useCurrentRoute("/manage/apps");

    const fetchInstalledApps = useCallback(() => {
        const timestamp = new Date().getTime();
        ApiService.get(`/api/v1/app/installed/all?timestamp=${timestamp}`, loginData?.token, navigate)
            .then(data => {
                // Convert array to Map for easier lookup with version info
                const appsMap = new Map(
                    data.message.map(app => [app.appId, app.version])
                );
                setInstalledApps(appsMap);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch installed apps list.");
            });
    }, [loginData?.token, navigate]);

    const checkForUpdates = (installedVersion, latestVersion) => {
        if (!installedVersion || !latestVersion) return false;
        try {
            return semver.gt(latestVersion, installedVersion);
        } catch (error) {
            console.error('Version comparison error:', error);
            return false;
        }
    };

    const loadApps = useCallback((page = 1, append = false) => {
        setIsLoadingMore(true);
        if (page === 1) setLoading(true);

        Promise.all([
            ApiService.get('https://cdn.jsdelivr.net/gh/Sanjeet990/AstrolumaApps/apps.json', null, navigate),
            fetchInstalledApps()
        ])
            .then(([appsData]) => {
                if (appsData?.length === 0) {
                    setHasMore(false);
                } else {
                    setAppList(prev => {
                        const combinedApps = append ? [...prev, ...appsData] : appsData;
                        return combinedApps.sort((a, b) =>
                            a.appName.toLowerCase().localeCompare(b.appName.toLowerCase())
                        );
                    });
                    //setCurrentPage(page);
                }
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch apps.");
            })
            .finally(() => {
                setLoading(false);
                setIsLoadingMore(false);
            });
    }, [setLoading, navigate, fetchInstalledApps]);

    useEffect(() => {
        loadApps(1, false);
    }, [loadApps]);

    const lastElementRef = useCallback(node => {
        if (isLoadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                //For future use
                //loadApps(currentPage + 1, true);
            }
        });

        if (node) observerRef.current.observe(node);
    }, [isLoadingMore, hasMore]);

    const uploadZip = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        event.target.value = '';

        if (!file) return;

        if (file.type !== 'application/zip' && !file.name.toLowerCase().endsWith('.zip')) {
            makeToast("error", "Please select a valid ZIP file.");
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            makeToast("error", "File size too large. Maximum size is 10MB.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        ApiService.postWithFormData('/api/v1/app/fromzip', formData, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Integration from zip is installed.");
                fetchInstalledApps();
                navigate("/manage/apps");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", error?.response?.data?.message || "Failed to upload file.");
            }).finally(() => {
                setLoading(false);
            });
    };

    

    if(!userData?.isSuperAdmin){
        return null;
    }
    
    return (
        <>
            <Helmet>
                <title>Browse Integrations</title>
            </Helmet>

            <Breadcrumb
                type="custom"
                pageTitle={"Browse Integrations"}
                breadcrumbList={[
                    { "id": "1", "linkName": "Settings", "linkUrl": "/manage" },
                    { "id": "2", "linkName": "Installed Integrations", "linkUrl": "/manage/apps" }
                ]}
            />

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
                    <NiceButton
                        onClick={uploadZip}
                        label="Upload Zip"
                        className="bg-buttonGeneric text-buttonText"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".zip"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="mt-8">
                {appList?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {appList.map((app, index) => {
                            const installedVersion = installedApps.get(app.appId);
                            const hasUpdate = checkForUpdates(installedVersion, app.version);
                            const isInstalled = installedApps.has(app.appId);

                            const StatusIcon = isInstalled ?
                                (hasUpdate ? FaDownload : FaSync) :
                                null;

                            return index === appList.length - 1 ? (
                                <div key={`${app.appId}_${index}`} ref={lastElementRef}>
                                    <SingleHostedApp
                                        app={app}
                                        isInstalled={isInstalled}
                                        StatusIcon={StatusIcon}
                                        hasUpdate={hasUpdate}
                                        installedVersion={installedVersion}
                                    />
                                </div>
                            ) : (
                                <SingleHostedApp
                                    key={`${app.appId}_${index}`}
                                    app={app}
                                    isInstalled={isInstalled}
                                    StatusIcon={StatusIcon}
                                    hasUpdate={hasUpdate}
                                    installedVersion={installedVersion}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <NoListing
                        mainText="Oops! Nothing to List here"
                        subText="Please add some apps to continue!"
                        buttonText="Go to home"
                        buttonLink="/"
                        displayIcon={<GrAppsRounded />}
                    />
                )}
                {isLoadingMore && hasMore && (
                    <div className="text-center py-4">Loading more...</div>
                )}
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(InstallApps);
export default MemoizedComponent;