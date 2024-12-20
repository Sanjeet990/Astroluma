import React from 'react';
import { IoCloseOutline, IoChevronForward } from "react-icons/io5";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authListState, authenticatorPanelState, selectedAuthState } from '../../atoms';
import OtpComponent from './OtpComponent';
import ImageView from '../Misc/ImageView';
import { motion, AnimatePresence } from 'framer-motion';
import ClickOutside from '../ClickOutside';

const AuthenticatorSidebar = () => {

    const setShowAuthenticator = useSetRecoilState(authenticatorPanelState);
    const [selectedService, setSelectedService] = useRecoilState(selectedAuthState);

    const services = useRecoilValue(authListState);

    const closeAuthenticator = () => {
        setShowAuthenticator(false);
        setSelectedService(null);
    }

    return (
        <ClickOutside onClick={() => closeAuthenticator()} className="relative">
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-authPanelBg text-authPanelText p-4 shadow-lg z-99999"
            >
                <div className="">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-lg ">TOTP Authenticator</h1>
                        <div className="flex items-center">
                            <motion.div className="mr-2 flex flex-col items-center" whileHover={{ scale: 1.3 }}>
                                <IoCloseOutline size={28} className="cursor-pointer" onClick={() => closeAuthenticator()} />
                            </motion.div>
                        </div>
                    </div>
                    {
                        <AnimatePresence>
                            {!selectedService && (
                                <motion.ul
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {services?.length > 0 ? (
                                        services.map((service, index) => (
                                            <motion.li
                                                key={index}
                                                onClick={() => setSelectedService(service)}
                                                className="flex items-center justify-between p-2 mb-2 bg-authPanelSingleItemBg rounded cursor-pointer"
                                                initial={{ scale: 1, opacity: 0, y: 20 }}
                                                animate={{ scale: 1.05, opacity: 1, y: 0 }}
                                                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.3, delay: index * 0.1 }}
                                            >
                                                <div className="flex items-center">
                                                    <ImageView alt="Link" src={service.serviceIcon} defaultSrc="/authenticator.png" errorSrc="/authenticator.png" height="40px" width="40px" />
                                                    <div className="flex-col items-start self-start ml-2">
                                                        <span className="mx-2 text-lg text-authPanelSingleItemText">{service.serviceName}</span>
                                                        <span className="mx-2 text-xs block text-authPanelSingleItemText">
                                                            {service.accountName || `${service.serviceName} account`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <IoChevronForward className="text-lg" />
                                            </motion.li>
                                        ))
                                    ) : (
                                        <div className="flex flex-col justify-center items-center h-screen">
                                            <img src="/otp.png" alt="" className="mb-4" style={{ width: '60px', height: '60px' }} />
                                            <div className="text-center p-4">No TOTP authenticator added</div>
                                        </div>
                                    )}
                                </motion.ul>
                            )}
                            {selectedService && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <OtpComponent />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    }
                </div>
            </motion.div>
        </ClickOutside>
    );
};


const MemoizedComponent = React.memo(AuthenticatorSidebar);
export default MemoizedComponent;
