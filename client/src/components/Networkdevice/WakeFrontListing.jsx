import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { contentLoadingState, filterQueryState, loginState, reloadFolderListingState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from "react-helmet"
import { PiDevicesDuotone } from "react-icons/pi";
import SingleDeviceItemFront from './SingleDeviceItemFront';
import ConfirmPacketSendModal from '../Modals/ConfirmPacketSendModal';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import { motion } from 'framer-motion';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NoListing from '../Misc/NoListing';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const WakeFrontListing = () => {

    const navigate = useNavigate();

    const [reloadData, setReloadData] = useRecoilState(reloadFolderListingState);
    const [itemList, setItemList] = useState([]);
    const [tempItemList, setTempItemList] = useState([]);

    const loginData = useRecoilValue(loginState);
    const [loading, setLoading] = useRecoilState(contentLoadingState);


    const globalFilterQuery = useRecoilValue(filterQueryState);

    useDynamicFilter(true);
    useCurrentRoute("/networkdevices");

    const doActualFilter = useCallback((query) => {
        const filteredItems = tempItemList.filter(item => {
            return item.deviceName.toLowerCase().includes(query.toLowerCase());
        });

        setItemList(filteredItems);
    }, [tempItemList]);

    useEffect(() => {
        if (globalFilterQuery) {
            doActualFilter(globalFilterQuery);
        } else {
            setItemList(tempItemList);
        }
    }, [globalFilterQuery, doActualFilter, tempItemList]);


    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/networkdevices/devices", loginData?.token, navigate)
            .then(data => {
                setItemList(data?.message?.items);
                setTempItemList(data?.message?.items);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Something went wrong!");
            }).finally(() => {
                setLoading(false);
                setReloadData(false);
            });
    }, [reloadData, loginData, setLoading, setReloadData, navigate]);


    return (
        <>
            <Helmet>
                <title>Network Devices</title>
            </Helmet>

            <ConfirmPacketSendModal />

            <Breadcrumb type="front" pageTitle={"Network Devices"} breadcrumbList={null} />

            <div className="mt-4">
                {
                    itemList.length > 0 ?
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {
                                itemList.map((item, index) => {
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            key={item._id}
                                        >
                                            <SingleDeviceItemFront item={item} />
                                        </motion.div>
                                    );
                                })}
                        </div> : !loading && <NoListing mainText="Oops! Nothing to List here" subText="Please add some devices first!" buttonText="Go to home" buttonLink="/" displayIcon={<PiDevicesDuotone />} />
                }
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(WakeFrontListing);
export default MemoizedComponent;
