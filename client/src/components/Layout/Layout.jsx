import React, { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { authenticatorPanelState, filterQueryState, selectedAuthState } from '../../atoms';
import AuthenticatorSidebar from '../Authenticator/AuthenticatorSidebar';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar/index';
import Header from '../Header/index';
import PropTypes from 'prop-types';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import Drawer from 'react-modern-drawer'
import emitter, { PAGE_BOTTOM_EVENT } from '../../events';

const Layout = ({ children }) => {

    // Mobile sidebar visibility state
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAuthenticator, setShowAuthenticator] = useRecoilState(authenticatorPanelState);
    const setSelectedService = useSetRecoilState(selectedAuthState);
    const setFilterQuery = useSetRecoilState(filterQueryState);


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
