import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import PropTypes from 'prop-types';

const NiceTab = ({ tabConfig, activeTab, setActiveTab }) => {
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const tabContainerRef = useRef(null);

    const checkScroll = () => {
        if (tabContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [tabConfig]);

    const scroll = (direction) => {
        if (tabContainerRef.current) {
            const scrollAmount = 200;
            tabContainerRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        checkScroll();
    };

    return (
        <div className="relative">
            <div
                ref={tabContainerRef}
                className="flex p-1 space-x-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={handleScroll}
            >
                {/* Add padding to prevent tabs from being hidden under buttons */}
                <div className="flex-none w-8" />
                <AnimatePresence>
                    {tabConfig.map((tab) => (
                        <motion.button
                            key={tab.name}
                            className={`text-xs px-4 py-2 rounded-full min-w-[100px] ${activeTab === tab.name
                                    ? 'bg-buttonGeneric text-buttonText'
                                    : 'bg-modalBg text-modalBodyText hover:bg-buttonGeneric/[0.12]'
                                }`}
                            onClick={() => setActiveTab(tab.name)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </AnimatePresence>
                {/* Add padding to prevent tabs from being hidden under buttons */}
                <div className="flex-none w-8" />
            </div>

            {/* Gradient fades for edges */}
            {showLeftArrow && (
                <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-itemCardHoverBg to-transparent pointer-events-none rounded-md" />
            )}
            {showRightArrow && (
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-itemCardHoverBg to-transparent pointer-events-none rounded-md" />
            )}

            <AnimatePresence>
                {showLeftArrow && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-itemCardBg p-1.5 rounded-full shadow-lg z-10"
                        onClick={() => scroll('left')}
                    >
                        <IoChevronBackOutline className="w-4 h-4" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRightArrow && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-itemCardBg p-1.5 rounded-full shadow-lg z-10"
                        onClick={() => scroll('right')}
                    >
                        <IoChevronForwardOutline className="w-4 h-4" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

NiceTab.propTypes = {
    tabConfig: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired
}

const MemoizedComponent = React.memo(NiceTab);
export default MemoizedComponent;