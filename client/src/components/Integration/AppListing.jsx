import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { integrationInstallModalState, loadingState, loginState } from '../../atoms';
import { Helmet } from 'react-helmet';
import { GrAppsRounded } from "react-icons/gr";
import SingleApp from './SingleApp';
import IntegrationInstallModal from '../Modals/IntegrationInstallModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceLink from '../NiceViews/NiceLink';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const AppListing = () => {

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const [appList, setAppList] = useState([]);

    const loginData = useRecoilValue(loginState);

    const setAppInstallModal = useSetRecoilState(integrationInstallModalState);

    useDynamicFilter(false);
    useCurrentRoute("/manage/apps");

    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/app/all", loginData?.token, navigate)
            .then(data => {
                setAppList(data?.message);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch apps.");
            }).finally(() => {
                setLoading(false);
            });
    }, [loginData?.token, setLoading, navigate]);

    const handleAppInstall = (app) => {
        setAppInstallModal({ isOpen: true, data: app })
    }

    return (
        <>
            <IntegrationInstallModal />
            <Helmet>
                <title>Add Integrations</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"Add Integrations"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Integrations", "linkUrl": "/manage/apps" }]} />

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
                    <NiceLink
                        to="/manage/apps"
                        text="Installed Integrations"
                        className="bg-buttonGeneric text-buttonText"
                    />
                </div>
            </div>
            <div className="mt-8">
                {
                    appList.length > 0 ?
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {appList.map((app) => {
                                return (
                                    <SingleApp key={app.appId} app={app} handleInstall={handleAppInstall} />
                                );
                            })}
                        </div> : <NoListing mainText="Oops! Nothing to List here" subText="Please add some apps first!" buttonText="Go to home" buttonLink="/" displayIcon={<GrAppsRounded />} />
                }
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(AppListing);
export default MemoizedComponent;
