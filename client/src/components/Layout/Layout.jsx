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
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { getMimeType } from '../../utils/Helper';

// Utility function to generate manifest JSON
const generateManifest = (userData, iconUrl, accentColor) => {
    if (!iconUrl) {
        return null;
    }

    const mimeType = getMimeType(iconUrl);
    return {
        name: userData?.siteName || 'Astroluma',
        short_name: userData?.siteName || 'Astroluma',
        description: 'Astroluma is a feature-rich, productivity oriented, user-friendly dashboard designed to help you manage multiple aspects of your daily tasks and services.',
        start_url: window?.location?.origin || "/",
        display: 'standalone',
        theme_color: accentColor,
        background_color: "#ffffff",
        icons: [
            {
                src: iconUrl,
                sizes: '192x192',
                type: mimeType
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: mimeType
            }
        ]
    };
};

const Layout = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAuthenticator, setShowAuthenticator] = useRecoilState(authenticatorPanelState);
    const setSelectedService = useSetRecoilState(selectedAuthState);
    const setFilterQuery = useSetRecoilState(filterQueryState);
    const userData = useRecoilValue(userDataState);
    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");
    const location = useLocation();
    
    // Use ref to store the current manifest URL
    const manifestUrlRef = useRef(null);

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

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
        if (!userData?.siteLogo) return null;
        
        const iconObject = userData.siteLogo;
        const prefix = iconObject?.iconProvider === "com.astroluma.self" ? `${import.meta.env.VITE_API_BASE_URL || ""}/images/` : "";
        const iconUrl = themeType === "dark" && iconObject?.iconUrlLight ? iconObject.iconUrlLight : iconObject?.iconUrl;
        return iconUrl ? `${prefix}${iconUrl}` : null;
    }, [userData, themeType]);

    const iconUrl = useMemo(() => decideTheIcon(), [decideTheIcon]);

    // Separate effect for meta tags
    useEffect(() => {
        const updateMetaTag = (property, content) => {
            if (!content) return;
            
            let metaTag = document.querySelector(`meta[property='${property}']`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', property);
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', content);
        };

        if (Object.keys(userData).length === 0) {
            // Set default favicon
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = '/default-favicon.ico';
            document.head.appendChild(link);

            // Set default Open Graph image
            updateMetaTag('og:image', '/default-og-image.jpg');
        } else if (iconUrl) {
            // Set dynamic favicon
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = iconUrl;
            document.head.appendChild(link);

            // Set dynamic Open Graph image
            updateMetaTag('og:image', iconUrl);
        }
    }, [userData, iconUrl]);

    // Separate effect for manifest handling
    useEffect(() => {
        const updateManifest = () => {
            // Clean up previous manifest URL if it exists
            if (manifestUrlRef.current) {
                URL.revokeObjectURL(manifestUrlRef.current);
            }

            // Only proceed with manifest generation if we have a valid icon URL
            if (iconUrl) {
                const accentColor = SystemThemes.find(theme => theme.value === colorTheme)?.accentColor || "#f5f5f5";
                const manifestData = generateManifest(userData, iconUrl, accentColor);
                
                if (manifestData) {
                    const manifestBlob = new Blob(
                        [JSON.stringify(manifestData, null, 2)],
                        { type: 'application/json' }
                    );
                    const newManifestUrl = URL.createObjectURL(manifestBlob);
                    manifestUrlRef.current = newManifestUrl;

                    // Update manifest link
                    let manifestLink = document.querySelector("link[rel='manifest']");
                    if (!manifestLink) {
                        manifestLink = document.createElement('link');
                        manifestLink.rel = 'manifest';
                        document.head.appendChild(manifestLink);
                    }
                    manifestLink.href = newManifestUrl;
                }
            }
        };

        updateManifest();

        // Cleanup function
        return () => {
            if (manifestUrlRef.current) {
                URL.revokeObjectURL(manifestUrlRef.current);
            }
        };
    }, [userData, iconUrl, colorTheme]);

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