import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authenticatorPanelState, colorThemeState, filterQueryState, selectedAuthState, userDataState } from '../../atoms';
import AuthenticatorSidebar from '../Authenticator/AuthenticatorSidebar';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar/index';
import Header from '../Header/index';
import PropTypes from 'prop-types';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import Drawer from 'react-modern-drawer'
import emitter, { PAGE_BOTTOM_EVENT } from '../../events';
import SystemThemes from '../../utils/SystemThemes';

const Layout = ({ children }) => {

    // Mobile sidebar visibility state
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAuthenticator, setShowAuthenticator] = useRecoilState(authenticatorPanelState);
    const setSelectedService = useSetRecoilState(selectedAuthState);
    const setFilterQuery = useSetRecoilState(filterQueryState);
    const userData = useRecoilValue(userDataState);

    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const location = useLocation();

    useEffect(() => {
        setShowSidebar(false);
        setSelectedService(null);
        setFilterQuery("");
    }, [location, setSelectedService, setFilterQuery]);


    const scrollRef = useBottomScrollListener(() => {
        emitter.emit(PAGE_BOTTOM_EVENT)
    });

    const authPanelClosed = () => {
        setShowAuthenticator(false);
    }

    const decideTheIcon = useCallback(() => {
        console.log(userData);
        const iconObject = userData?.siteLogo;
        let prefix = "";
        if (iconObject?.iconProvider === "com.astroluma.self") prefix = `${import.meta.env.VITE_API_BASE_URL}/images/`;
        if (themeType === "dark" && iconObject?.iconUrlLight) {
            return `${prefix}${iconObject?.iconUrlLight}`;
        } else {
            return `${prefix}${iconObject?.iconUrl}`;
        }
    }, [userData, themeType]);

    useEffect(() => {

        const updateMetaTag = (property, content) => {
            let metaTag = document.querySelector(`meta[property='${property}']`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', property);
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', content);
        };

        if (Object.keys(userData).length === 0) {
            // Set favicon
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = '/default-favicon.ico'; // Replace with your default favicon URL
            document.head.appendChild(link);

            // Set Open Graph image
            updateMetaTag('og:image', '/default-og-image.jpg');
        } else {
            // Set favicon for populated userData
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = decideTheIcon(); // Replace with your dynamic favicon URL
            document.head.appendChild(link);

            // Set Open Graph image
            updateMetaTag('og:image', decideTheIcon());
        }
    }, [userData, decideTheIcon]);


    return (
        <>
            <Sidebar sidebarOpen={showSidebar} setSidebarOpen={setShowSidebar} />

            <div ref={scrollRef} className="relative flex flex-1 flex-col overflow-x-hidden scrollArea scrollbar-light">
                <Header sidebarOpen={showSidebar} setSidebarOpen={setShowSidebar} />
                <main>
                    {children}
                </main>
            </div>
            <AnimatePresence>
                <Drawer
                    open={showAuthenticator}
                    onClose={authPanelClosed}
                    size={360}
                    zIndex={1100}
                    lockBackgroundScroll={true}
                    className='w-full md:w-96'
                    direction='right'
                >
                    <AuthenticatorSidebar />
                </Drawer>
            </AnimatePresence>
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired
};

const MemoizedComponent = React.memo(Layout);
export default MemoizedComponent;
