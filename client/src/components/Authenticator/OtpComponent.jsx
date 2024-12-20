import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { selectedAuthState } from '../../atoms';
import { TOTP } from "totp-generator"
import ImageView from '../Misc/ImageView';
import { motion } from 'framer-motion';
import NiceButton from '../NiceViews/NiceButton';
import NiceLoader from '../NiceViews/NiceLoader';

const OtpComponent = () => {
    const [selectedService, setSelectedService] = useRecoilState(selectedAuthState);
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [totalTime, setTotalTime] = useState(30);
    const [otpGenerated, setOtpGenerated] = useState(false);

    useEffect(() => {
        setTimeLeft(30);
        setTotalTime(30);
        setOtpGenerated(false);

        const timer = setInterval(() => {

            const { otp: generatedOtp, expires } = TOTP.generate(selectedService.secretKey);
            setOtp(generatedOtp);
            setOtpGenerated(true);
            setTimeLeft(Math.floor((expires - Date.now()) / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, [selectedService]);

    return (
        <div className="card mt-4 p-4 bg-authPanelSingleItemBg rounded relative h-112">
            <div className="flex justify-center items-center mb-4">
                <ImageView alt="Link" src={selectedService.serviceIcon} defaultSrc="/authenticator.png" errorSrc="/authenticator.png" height="100px" width="100px" />
            </div>
            <h2 className="text-3xl  text-center">{selectedService.serviceName}</h2>
            <span className="mx-2 text-sm text-center block mb-4">
                {selectedService.accountName || `${selectedService.serviceName} account`}
            </span>
            {!otp ? (
                <motion.div
                    className="flex flex-col justify-center items-center text-2xl  text-center mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <NiceLoader className='text-authpanelOtpLoaderColor' />
                    <div className='m-4'>Generating OTP</div>
                </motion.div>
            ) : (
                <motion.div
                    className="items-center text-center mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-5xl  mb-4 Orbitron text-authpanelOtpColor">
                        {otp}
                    </div>
                    <div className="text-center mb-4">Expires in: {timeLeft} seconds</div>
                </motion.div>
            )}

            <div className="flex items-center justify-center">
                <NiceButton
                    label='Close'
                    className='bg-buttonGeneric text-buttonText'
                    onClick={() => setSelectedService(null)}
                />
            </div>
            {otpGenerated && <div style={{ width: `${(timeLeft / totalTime) * 100}%`, transition: 'width 1s' }} className="absolute rounded bottom-0 left-0 bg-authPanelprogressColor h-2" />}
        </div>
    );
};


const MemoizedComponent = React.memo(OtpComponent);
export default MemoizedComponent;
