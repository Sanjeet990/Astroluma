import React, { useEffect, useState, useCallback, useRef } from 'react';
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, removeInstalledIntegrationModalState } from '../../atoms';
import { Helmet } from 'react-helmet';
import { GrAppsRounded } from "react-icons/gr";
import SingleInstalledApp from './SingleInstalledApp';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceLink from '../NiceViews/NiceLink';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import RemoveInstalledIntegration from '../Modals/RemoveInstalledIntegration';
import { useNavigate } from 'react-router-dom';
import emitter, { RELOAD_INSTALLED_APPS } from '../../events';

const InstalledApps = () => {
    const navigate = useNavigate();
    const setLoading = useSetRecoilState(loadingState);
    const setRemoveInstalledIntegration = useSetRecoilState(removeInstalledIntegrationModalState);
    const [appList, setAppList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observer = useRef();

    const loginData = useRecoilValue(loginState);

    useDynamicFilter(false);
    useCurrentRoute("/manage/apps");

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

    // Initial data load
    useEffect(() => {

        emitter.on(RELOAD_INSTALLED_APPS, reloadData);

        loadInitialData();

        return () => {
            emitter.off(RELOAD_INSTALLED_APPS, reloadData);
        };

    }, [loadInitialData]);

    // Reload data after successful syncFromDisk
    const reloadData = useCallback(() => {
        setCurrentPage(1);
        setHasMore(true);
        loadInitialData();
    }, [loadInitialData]);

    const handleAppRemove = (app) => {
        setRemoveInstalledIntegration({ isOpen: true, data: { app } });
    };

    const syncFromDisk = () => {
        setLoading(true);

        ApiService.get('/api/v1/app/sync', loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Sync completed successfully.");
                fetchApps(1, false);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", error?.response?.data?.message || "Failed to sync.");
            }).finally(() => {
                setLoading(false);
            });
    }

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

            <RemoveInstalledIntegration onSuccess={reloadData} />

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
                    <NiceButton
                        onClick={syncFromDisk}
                        label="Sync from Disk"
                        className="bg-buttonGeneric text-buttonText"
                    />
                    <NiceLink
                        to="/manage/apps/install"
                        label="Install Integrations"
                        className="bg-buttonGeneric text-buttonText"
                    />
                </div>
            </div>

            <div className="mt-8">
                {appList?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {appList.map((app, index) => {
                            if (index === appList.length - 1) {
                                return (
                                    <div ref={lastAppElementRef} key={`${app.appId}_${index}`}>
                                        <SingleInstalledApp
                                            app={app}
                                            handleAppRemove={handleAppRemove}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <SingleInstalledApp
                                    key={`${app.appId}_${index}`}
                                    app={app}
                                    handleAppRemove={handleAppRemove}
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