import React, { useState } from 'react';
import ImageView from '../Misc/ImageView';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loginState, sendmagicPacketState } from '../../atoms';
import DeviceStatus from './DeviceStatus';
import { BsEthernet } from "react-icons/bs";
import { GrVirtualMachine } from "react-icons/gr";
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SingleDeviceItemFront = (props) => {

    const doConfirm = useSetRecoilState(sendmagicPacketState);
    const loginData = useRecoilValue(loginState);

    const [isAlive, setIsAlive] = useState(props.item.isAlive);
    const [isInstantLoading, setIsInstantLoading] = useState(false);

    const handleDeviceWakeUp = () => {
        //console.log('Wake up device');
        if (props.item.supportsWol === true) {
            doConfirm({ data: props.item, isOpen: true });
        }
    }

    const instantFetch = (e) => {
        e.stopPropagation();

        setIsInstantLoading(true);

        if (props.item.deviceIp) {
            const host = import.meta.env.VITE_API_WS_URL || `ws://${window.location.host}`;

            const ws = new WebSocket(`${host}?token=${loginData?.token}`);

            ws.onopen = () => {
                ws.send(`instant-${props.item._id}`);
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.deviceIp === props.item.deviceIp) {
                    setIsAlive(message.alive);
                    ws.close();
                } else {
                    //console.log(message.deviceIp, props.item.deviceIp);
                }
                setIsInstantLoading(false);
            };

            ws.onclose = () => {
                //console.log('WebSocket connection closed');
                setIsInstantLoading(false);
            };

            ws.onerror = () => {
                setIsInstantLoading(false);
            };
        }
    }

    return (
        <div
            role='button'
            key={props.item._id}
            onClick={handleDeviceWakeUp}
            className="relative">
            <motion.div whileHover={{ scale: 1.03 }} className={`${props.item.supportsWol && 'cursor-pointer'} relative border-2 border-itemCardBorder bg-itemCardBg text-itemCardText hover:border-itemCardHoverBorder hover:bg-itemCardHoverBg hover:text-itemCardHoverText pt-10 pb-10 rounded-xl shadow-md h-80 transition-all duration-300`} style={{ overflow: 'hidden' }} >
                <>
                    <div className='flex items-center justify-center p-8'>
                        <ImageView alt="Link" src={props.item.deviceIcon ? props.item.deviceIcon : "/computer.png"} defaultSrc="/computer.png" errorSrc="/computer.png" width="80px" />
                    </div>
                    <div className='flex items-center justify-center text-center overflow-hidden !min-h-10 !max-h-10 mb-4'>{props.item.deviceName}</div>
                    <div className='flex items-center justify-center text-center overflow-hidden text-xs'>
                        MAC : {props.item.deviceMac ? props.item.deviceMac : 'N/A'}
                    </div>
                    <div className='flex items-center justify-center text-center overflow-hidden text-xs'>
                        IP : {props.item.deviceIp ? props.item.deviceIp : 'N/A'}
                    </div>
                </>

                {
                    props.item.supportsWol && <span
                        className="absolute top-0 left-2 p-2 m-2"
                    >
                        <BsEthernet />
                    </span>
                }

                {
                    props.item.virtualDevice && <span
                        className={`absolute top-0 left-${props.item.supportsWol ? 10 : 2} p-2 m-2`}
                    >
                        <GrVirtualMachine />
                    </span>
                }

                {
                    props.item.deviceIp && <span
                        className="absolute top-0 right-2 p-2 m-2"
                    >
                        <DeviceStatus status={isAlive} instantFetch={instantFetch} loading={isInstantLoading} />
                    </span>
                }
            </motion.div >
        </div>
    );
};

SingleDeviceItemFront.displayName = 'SingleDeviceItemFront';

SingleDeviceItemFront.propTypes = {
    item: PropTypes.object.isRequired
}

const MemoizedComponent = React.memo(SingleDeviceItemFront);
export default MemoizedComponent;
