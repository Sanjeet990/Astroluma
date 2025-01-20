import React, { useCallback, useEffect, useState } from 'react';
import { IoChevronForward } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from 'recoil';
import { authListState, authenticatorPanelState, colorThemeState, selectedAuthState } from '../../atoms';
import OtpComponent from './OtpComponent';
import ImageView from '../Misc/ImageView';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import SystemThemes from '../../utils/SystemThemes';

const AuthenticatorSidebar = () => {
    const [showAuthenticator, setShowAuthenticator] = useRecoilState(authenticatorPanelState);
    const [selectedService, setSelectedService] = useRecoilState(selectedAuthState);
    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");
    const services = useRecoilValue(authListState);

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const closeAuthenticator = () => {
        setShowAuthenticator(false);
        setSelectedService(null);
    }

    const decideTheIcon = useCallback((service) => {
        const iconObject = service?.serviceIcon;
        return themeType === "dark" && iconObject?.iconUrlLight
            ? iconObject?.iconUrlLight
            : iconObject?.iconUrl;
    }, [themeType]);

    // Container animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: { opacity: 0 }
    };

    // List item animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 17
            }
        },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div className="bg-authPanelBg text-authPanelText min-h-screen flex flex-col h-screen">
            <div className="p-4 bg-authPanelBg sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-md">TOTP Authenticator</h1>
                <button className="text-md">
                    <FaTimes onClick={closeAuthenticator} />
                </button>
            </div>

            {
                showAuthenticator && <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence>
                        {!selectedService && (
                            <motion.ul
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                className="p-2"
                            >
                                {services?.length > 0 ? (
                                    services.map((service, index) => (
                                        <motion.li
                                            key={index}
                                            onClick={() => setSelectedService(service)}
                                            className="flex items-center justify-between p-2 mb-2 bg-authPanelSingleItemBg rounded cursor-pointer"
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            layout
                                        >
                                            <div className="flex items-center">
                                                <ImageView
                                                    alt="Link"
                                                    src={decideTheIcon(service)}
                                                    defaultSrc="/authenticator.png"
                                                    errorSrc="/authenticator.png"
                                                    height="40px"
                                                    width="40px"
                                                />
                                                <div className="flex-col items-start self-start ml-2">
                                                    <span className="mx-2 text-lg text-authPanelSingleItemText">
                                                        {service.serviceName}
                                                    </span>
                                                    <span className="mx-2 text-xs block text-authPanelSingleItemText">
                                                        {service.accountName || `${service.serviceName} account`}
                                                    </span>
                                                </div>
                                            </div>
                                            <IoChevronForward className="text-lg" />
                                        </motion.li>
                                    ))
                                ) : (
                                    <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)]">
                                        <img
                                            src="/otp.png"
                                            alt=""
                                            className="mb-4"
                                            style={{ width: '60px', height: '60px' }}
                                        />
                                        <div className="text-center p-4">No TOTP authenticator added</div>
                                    </div>
                                )}
                            </motion.ul>
                        )}
                        {selectedService && (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 17
                                }}
                                className="p-2"
                            >
                                <OtpComponent />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            }
        </div>
    );
};

const MemoizedComponent = React.memo(AuthenticatorSidebar);
export default MemoizedComponent;