import React, { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isHostModeState, userDataState } from '../../atoms';
import WelcomeUser from '../Misc/WelcomeUser';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import SingleSettingsItem from './SingleSettingsItem';
import { MdOutlineImportantDevices, MdSmartDisplay, MdFace, MdMenuBook, MdListAlt, MdContactSupport } from "react-icons/md";
import { FaCloudSunRain, FaTshirt, FaHome, FaIcons, FaUserCircle, FaCoffee } from "react-icons/fa";
import { IoSettingsSharp, IoQrCode } from "react-icons/io5";
import { BsAppIndicator } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CONSTANTS } from '../../utils/Constants';

const Settings = () => {

    const navigate = useNavigate();

    const userData = useRecoilValue(userDataState);
    const setActiveRoute = useCurrentRoute();

    const isHostMode = useRecoilValue(isHostModeState);

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
            title: 'Icon Packs',
            description: 'Manage icon pack settings of your account',
            icon: <FaIcons />,
            show: true,
            route: '/manage/iconpack'
        },
        {
            id: 8,
            title: 'Stream Hub',
            description: 'Setup and stream your RTSP/HLS/DASH feeds',
            icon: <MdSmartDisplay />,
            show: userData?.camerafeed,
            route: '/manage/streaming'
        },
        {
            id: 9,
            title: 'Network Devices',
            description: 'Manage network devices and their settings',
            icon: <MdOutlineImportantDevices />,
            show: (userData?.networkdevices && isHostMode),
            route: '/manage/networkdevices'
        },
        {
            id: 10,
            title: 'TOTP Authenticator',
            description: 'Manage your TOTP authenticator settings',
            icon: <IoQrCode />,
            show: userData?.authenticator,
            route: '/manage/totp'
        },
        {
            id: 11,
            title: 'App Integration',
            description: 'Setup integrations with number of other supported apps',
            icon: <BsAppIndicator />,
            show: true,
            route: '/manage/apps'
        },
        {
            id: 12,
            title: 'User Account',
            description: 'Manage account settings and preferences',
            icon: <MdFace />,
            show: userData?.isSuperAdmin,
            route: '/manage/accounts'
        },
        {
            id: 13,
            title: 'My Profile',
            description: 'Manage own profile settings and preferences',
            icon: <FaUserCircle />,
            show: true,
            route: '/manage/profile'
        },
        {
            id: 14,
            title: 'Get Support',
            description: 'Get help and support related to Astroluma',
            icon: <MdContactSupport />,
            show: true,
            route: 'https://getastroluma.com/contact'
        },
        {
            id: 15,
            title: 'Buy Me a Coffee',
            description: 'Support the developer by buying a coffee',
            icon: <FaCoffee />,
            show: true,
            route: CONSTANTS.BuyMeACoffee
        },
    ]

    const manageSelection = useCallback((Setting) => {
        if (Setting?.route.startsWith('http')) {
            window.open(Setting?.route, '_blank');
        } else {
            navigate(Setting?.route);
        }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {
                        SettingItems.map((item, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={item.id}
                            >
                                {
                                    item.show &&
                                    <SingleSettingsItem Setting={item} onSelect={manageSelection} />
                                }
                            </motion.div>
                        ))
                    }
                </div>
            </div>

        </>
    );
};

const MemoizedComponent = React.memo(Settings);
export default MemoizedComponent;