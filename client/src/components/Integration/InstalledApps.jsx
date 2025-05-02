import React, { useEffect, useState, useCallback, useRef } from 'react';
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { integrationConfigureModalState, loadingState, loginState, removeInstalledIntegrationModalState, userDataState } from '../../atoms';
import { Helmet } from 'react-helmet';
import { GrAppsRounded } from "react-icons/gr";
import SingleInstalledApp from './SingleInstalledApp';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceLink from '../NiceViews/NiceLink';
import NiceTip from '../NiceViews/NiceTip';
import makeToast from '../../utils/ToastUtils';
import RemoveInstalledIntegration from '../Modals/RemoveInstalledIntegration';
import { useNavigate } from 'react-router-dom';
import emitter, { RELOAD_INSTALLED_APPS } from '../../events';
import AdditionalIntegrationConfigurationModal from '../Modals/AdditionalIntegrationConfigurationModal';
import NiceButton from '../NiceViews/NiceButton';

const InstalledApps = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const setLoading = useSetRecoilState(loadingState);

    const setConfigModalState = useSetRecoilState(integrationConfigureModalState);
    const setRemoveInstalledIntegration = useSetRecoilState(removeInstalledIntegrationModalState);
    const [appList, setAppList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observer = useRef();

    const loginData = useRecoilValue(loginState);
    const userData = useRecoilValue(userDataState);

    const isSuperAdmin = userData?.isSuperAdmin;

    useDynamicFilter(false);
    useCurrentRoute("/manage/apps");

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
                reloadData();
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", error?.response?.data?.message || "Failed to upload file.");
            }).finally(() => {
                setLoading(false);
            });
    };

    const fetchApps = useCallback(async (page) => {
        try {
            const data = await ApiService.get(`/api/v1/app/installed?page=${page}`, loginData?.token, navigate);
            if (data?.message?.page >= data?.message?.pages) {
                setHasMore(false);
            }
            setHasMore(true);
            return data?.message?.appList || [];
        } catch (error) {
            if (!error.handled) makeToast("error", "Failed to fetch installed apps.");
            return [];
        }
    }, [loginData?.token, navigate]);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        const apps = await fetchApps(1);
        setAppList(apps);
        setLoading(false);
    }, [fetchApps, setLoading]);

    const loadMoreData = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        const newApps = await fetchApps(nextPage);

        if (newApps.length > 0) {
            setAppList(prev => [...prev, ...newApps]);
            setCurrentPage(nextPage);
        } else {
            setHasMore(false);
        }
        setIsLoadingMore(false);
    }, [currentPage, fetchApps, hasMore, isLoadingMore]);

    // Intersection Observer setup for infinite scroll
    const lastAppElementRef = useCallback(node => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreData();
            }
        });

        if (node) observer.current.observe(node);
    }, [hasMore, isLoadingMore, loadMoreData]);


    // Reload data
    const reloadData = useCallback(() => {
        setCurrentPage(1);
        setHasMore(true);
        loadInitialData();
    }, [loadInitialData]);

    // Initial data load
    useEffect(() => {
        emitter.on(RELOAD_INSTALLED_APPS, reloadData);
        loadInitialData();

        return () => {
            emitter.off(RELOAD_INSTALLED_APPS, reloadData);
        };
    }, [loadInitialData, reloadData]);

    const handleAppRemove = (app) => {
        setRemoveInstalledIntegration({ isOpen: true, data: { app } });
    };

    const handleConfigureClick = (app) => {
        setConfigModalState({ isOpen: true, data: app });
    };

    return (
        <>
            <Helmet>
                <title>Installed Integrations</title>
            </Helmet>

            <Breadcrumb
                type="custom"
                pageTitle="Installed Integrations"
                breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]}
            />

            <AdditionalIntegrationConfigurationModal />
            <RemoveInstalledIntegration onSuccess={reloadData} />

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className={`flex flex-wrap justify-end space-x-2 mt-4 md:mt-0 mb-4 ${!isSuperAdmin ? "hidden" : ""}`}>
                    <NiceLink
                        to="/manage/apps/install"
                        label="Install Integrations"
                        className="bg-buttonGeneric text-buttonText"
                    />
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

            {
                !isSuperAdmin && <NiceTip title="Information">
                    Only Admin can install, update and remove integrations. You can only view and use the installed integrations.
                </NiceTip>
            }
            <div className="mt-8">
                {appList?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {appList.map((app, index) => {
                            if (index === appList.length - 1) {
                                return (
                                    <div ref={lastAppElementRef} key={`${app.appId}_${index}`}>
                                        <SingleInstalledApp
                                            app={app}
                                            configurationHandler={handleConfigureClick}
                                            handleAppRemove={handleAppRemove}
                                            refreshApps={reloadData}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <SingleInstalledApp
                                    key={`${app.appId}_${index}`}
                                    app={app}
                                    configurationHandler={handleConfigureClick}
                                    handleAppRemove={handleAppRemove}
                                    refreshApps={reloadData}
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
                {isLoadingMore && (
                    <div className="text-center py-4">Loading more...</div>
                )}
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(InstalledApps);
export default MemoizedComponent;