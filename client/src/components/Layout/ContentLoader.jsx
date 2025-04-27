import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { contentLoadingState, loadingState } from '../../atoms';
import { motion, AnimatePresence } from 'framer-motion';
import NiceLoader from '../NiceViews/NiceLoader.jsx';
import PropTypes from 'prop-types';

const ContentLoader = ({ children }) => {
    const loading = useRecoilValue(contentLoadingState);
    const globalLoading = useRecoilValue(loadingState);
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        let timeout;
        if (loading && !globalLoading) {
            setShowLoader(true);
        } else {
            timeout = setTimeout(() => setShowLoader(false), 200); // Wait for 200ms before hiding loader
        }
        return () => clearTimeout(timeout); // Cleanup timeout if component unmounts or state changes again
    }, [loading, globalLoading]);

    return (
        <div className="relative contentArea">
            {children}
            <AnimatePresence>
                {showLoader && (
                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-0 flex justify-center bg-bodyBg"
                        style={{ minHeight: '80vh', paddingTop: '15%' }}
                        transition={{ duration: 0.05, ease: "easeInOut" }}
                    >
                        <div style={{ height: 'auto' }}>
                            <NiceLoader className='text-loaderColor' />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ContentLoader.propTypes = {
    children: PropTypes.node.isRequired
};

const MemoizedComponent = React.memo(ContentLoader);
export default MemoizedComponent;
