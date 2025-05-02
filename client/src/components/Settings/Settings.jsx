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

    // Featured Settings - Always shown at the top with special styling
    const featuredSettings = [
        {
            id: 3,
            title: 'Listings',
            description: 'Manage your links, todos, snippets in different folders',
            icon: <MdListAlt />,
            show: true,
            route: '/manage/listing',
            featured: true  // Mark as featured for special styling
        },
    ];

    // Regular settings items
    const regularSettings = [
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
            title: 'Live Apps',
            description: 'Setup Live Apps with number of other supported apps',
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
    ];

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

            {/* Featured Listings Section - Beautiful Design with Theme Colors */}
            {featuredSettings.filter(item => item.show).length > 0 && (
                <div className="w-full my-8 relative">
                    <div className="absolute inset-0 bg-cardBg/30 rounded-xl transform -skew-y-1 shadow-xl -z-10"></div>
                    
                    {featuredSettings
                        .filter(item => item.show)
                        .map((item) => (
                            <div 
                                key={item.id}
                                className="relative overflow-hidden rounded-xl bg-cardBg border border-cardBorder shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-l from-itemCardHoverBg/30 to-transparent"></div>
                                
                                <div className="flex flex-col lg:flex-row p-6 md:p-8">
                                    {/* Left content */}
                                    <div className="w-full lg:w-2/3">
                                        <div className="flex items-center mb-4">
                                            <div className="mr-4 p-3 bg-buttonGeneric rounded-full text-buttonText">
                                                <div className="text-3xl">
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <h2 className="text-3xl font-bold text-headerText">
                                                {item.title}
                                            </h2>
                                        </div>
                                        
                                        <p className="text-lg mb-6 text-bodyText max-w-2xl">
                                            {item.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-3 mb-6 lg:mb-0">
                                            <button 
                                                onClick={() => navigate(item.route)}
                                                className="px-5 py-2.5 bg-buttonGeneric text-buttonText rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center shadow-md hover:shadow-lg"
                                            >
                                                <span>Manage Listings</span>
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                                </svg>
                                            </button>
                                            
                                            <button 
                                                onClick={() => navigate(`${item.route}/save/folder`)}
                                                className="px-5 py-2.5 bg-buttonSuccess text-buttonText rounded-lg font-semibold hover:bg-opacity-90 transition shadow-md hover:shadow-lg"
                                            >
                                                Add New Folder
                                            </button>
                                            
                                            <button 
                                                onClick={() => navigate(`${item.route}/save/link`)}
                                                className="px-5 py-2.5 bg-buttonInfo text-buttonText rounded-lg font-semibold hover:bg-opacity-90 transition shadow-md hover:shadow-lg"
                                            >
                                                Add New Link
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Right content - Quick Stats */}
                                    <div className="w-full lg:w-1/3 flex items-center justify-end mt-6 lg:mt-0">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-itemCardBg p-4 rounded-lg border border-itemCardBorder shadow-md hover:shadow-lg transition-shadow">
                                                <div className="text-2xl font-bold text-buttonGeneric">Folders</div>
                                                <div className="text-sm text-bodyText">Organize your content</div>
                                            </div>
                                            <div className="bg-itemCardBg p-4 rounded-lg border border-itemCardBorder shadow-md hover:shadow-lg transition-shadow">
                                                <div className="text-2xl font-bold text-buttonInfo">Links</div>
                                                <div className="text-sm text-bodyText">Quick access to sites</div>
                                            </div>
                                            <div className="bg-itemCardBg p-4 rounded-lg border border-itemCardBorder shadow-md hover:shadow-lg transition-shadow">
                                                <div className="text-2xl font-bold text-buttonWarning">Todos</div>
                                                <div className="text-sm text-bodyText">Track your tasks</div>
                                            </div>
                                            <div className="bg-itemCardBg p-4 rounded-lg border border-itemCardBorder shadow-md hover:shadow-lg transition-shadow">
                                                <div className="text-2xl font-bold text-buttonSuccess">Snippets</div>
                                                <div className="text-sm text-bodyText">Code management</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bottom Tags Section */}
                                <div className="bg-itemCardHoverBg bg-opacity-10 px-8 py-4 flex flex-wrap gap-x-4 gap-y-2 items-center border-t border-cardBorder">
                                    <div className="text-sm font-medium text-bodyText">Features:</div>
                                    <div className="px-3 py-1 rounded-full bg-buttonGeneric bg-opacity-10 text-buttonGeneric text-sm">Drag & Drop</div>
                                    <div className="px-3 py-1 rounded-full bg-buttonInfo bg-opacity-10 text-buttonInfo text-sm">Organize</div>
                                    <div className="px-3 py-1 rounded-full bg-welcomeUsernameText bg-opacity-10 text-welcomeUsernameText text-sm">Categorize</div>
                                    <div className="px-3 py-1 rounded-full bg-buttonSuccess bg-opacity-10 text-buttonSuccess text-sm">Share</div>
                                    <div className="px-3 py-1 rounded-full bg-buttonWarning bg-opacity-10 text-buttonWarning text-sm">Flexible View</div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Other Settings - Enhanced Grid Design */}
            <div className="w-full mt-12">
                <h2 className="text-xl font-semibold mb-6 text-headerText flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Other Settings
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {
                        regularSettings.map((item, index) => (
                            item.show && <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={item.id}
                            >
                                <SingleSettingsItem Setting={item} onSelect={manageSelection} />
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </>
    );
};

export default Settings;