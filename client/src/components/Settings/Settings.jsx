import React, { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState } from '../../atoms';
import WelcomeUser from '../Misc/WelcomeUser';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import SingleSettingsItem from './SingleSettingsItem';
import { MdOutlineImportantDevices, MdSmartDisplay, MdFace, MdMenuBook, MdListAlt } from "react-icons/md";
import { FaCloudSunRain, FaTshirt, FaHome } from "react-icons/fa";
import { IoSettingsSharp, IoQrCode } from "react-icons/io5";
import { BsAppIndicator } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

const Settings = () => {

    const navigate = useNavigate();

    const userData = useRecoilValue(userDataState);
    const setActiveRoute = useCurrentRoute();

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute("/manage");
    }, [setActiveRoute]);

    const SettingItems = [
        {
            id: 1,
            title: 'Home',
            description: 'Go to the home page and start exploring',
            icon: <FaHome />,
            show: true,
            route: '/'
        },
        {
            id: 2,
            title: 'General',
            description: 'Manage general settings of your account',
            icon: <IoSettingsSharp />,
            show: true,
            route: '/manage/general'
        },
        {
            id: 3,
            title: 'Listings',
            description: 'Manage your links, todos, snippets in different folders',
            icon: <MdListAlt />,
            show: true,
            route: '/manage/listing'
        },
        {
            id: 4,
            title: 'Pages',
            description: 'Create and publish information packed pages',
            icon: <MdMenuBook />,
            show: true,
            route: '/manage/page'
        },
        {
            id: 5,
            title: 'Weather',
            description: 'Manage weather settings of your account',
            icon: <FaCloudSunRain />,
            show: true,
            route: '/manage/weather'
        },
        {
            id: 6,
            title: 'Themes',
            description: 'Manage theme settings of your account',
            icon: <FaTshirt />,
            show: true,
            route: '/manage/theme'
        },
        {
            id: 7,
            title: 'Stream Hub',
            description: 'Setup and stream your RTSP/HLS/DASH feeds',
            icon: <MdSmartDisplay />,
            show: userData?.camerafeed,
            route: '/manage/streaming'
        },
        {
            id: 8,
            title: 'Network Devices',
            description: 'Manage network devices and their settings',
            icon: <MdOutlineImportantDevices />,
            show: userData?.networkdevices,
            route: '/manage/networkdevices'
        },
        {
            id: 9,
            title: 'TOTP Authenticator',
            description: 'Manage your TOTP authenticator settings',
            icon: <IoQrCode />,
            show: userData?.authenticator,
            route: '/manage/totp'
        },
        {
            id: 10,
            title: 'App Integration',
            description: 'Setup integrations with number of other supported apps',
            icon: <BsAppIndicator />,
            show: true,
            route: '/manage/apps'
        },
        {
            id: 11,
            title: 'User Account',
            description: 'Manage account settings and preferences',
            icon: <MdFace />,
            show: true,
            route: '/manage/accounts'
        },
    ]

    const manageSelection = useCallback((Setting) => {
        navigate(Setting?.route);
    }, [navigate]);

    return (
        <>
            <Helmet>
                <title>Settings</title>
            </Helmet>

            <div className="flex flex-row space-x-4">
                <div className="w-full md:block">
                    <WelcomeUser name={userData?.fullName} />
                </div>
            </div>
            <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {
                        SettingItems.map(item => (
                            item.show && <SingleSettingsItem key={item.id} Setting={item} onSelect={manageSelection} />
                        ))
                    }
                </div>
            </div>

        </>
    );
};

const MemoizedComponent = React.memo(Settings);
export default MemoizedComponent;