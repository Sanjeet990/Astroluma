import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { deleteIntegrationModalState, deletedIntegrationState, loadingState, loginState } from '../../atoms';
import { Helmet } from 'react-helmet';
import { GrAppsRounded } from "react-icons/gr";
import SingleInstalledApp from './SingleInstalledApp';
import DeleteIntegrationModal from '../Modals/DeleteIntegrationModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceLink from '../NiceViews/NiceLink';
import makeToast from '../../utils/ToastUtils';

const InstalledApps = () => {

    const setLoading = useSetRecoilState(loadingState);
    const [appList, setAppList] = useState([]);

    const loginData = useRecoilValue(loginState);

    const setAppRemoveModal = useSetRecoilState(deleteIntegrationModalState);

    const deletedIntegration = useRecoilValue(deletedIntegrationState);

    useDynamicFilter(false);
    useCurrentRoute("/manage/apps");

    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/app/installed", loginData?.token)
            .then(data => {
                //console.log(data?.message);
                setAppList(data?.message);
            })
            .catch(() => {
                makeToast("error", "Failed to fetch installed apps.");
            }).finally(() => {
                setLoading(false);
            });
    }, [deletedIntegration, loginData?.token, setLoading]);

    const handleAppRemove = (app) => {
        setAppRemoveModal({ isOpen: true, data: app })
    }

    return (
        <>
            <DeleteIntegrationModal />
            <Helmet>
                <title>Installed Integrations</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"Installed Integrations"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
                    <NiceLink
                        to="/manage/apps/all"
                        label="Add Integration"
                        className="bg-buttonGeneric text-buttonText"
                    />
                </div>
            </div>
            <div className="mt-8">
                {
                    appList?.length > 0 ?
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {appList.map((app, index) => {
                                return (
                                    <SingleInstalledApp key={`${app.appId}_${index}`} app={app} handleAppRemove={handleAppRemove} />
                                );
                            })}
                        </div> : <NoListing mainText="Oops! Nothing to List here" subText="Please add some apps to continue!" buttonText="Go to home" buttonLink="/" displayIcon={<GrAppsRounded />} />
                }
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(InstalledApps);
export default MemoizedComponent;
