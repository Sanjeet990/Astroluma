import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { contentLoadingState, filterQueryState, loginState, reloadFolderListingState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from "react-helmet"
import { FaCameraRetro } from "react-icons/fa";
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NoListing from '../Misc/NoListing';
import { motion } from 'framer-motion';
import SingleFeed from '../Camera/SingleFeed';
import makeToast from '../../utils/ToastUtils';


const StreamListing = () => {
    const params = useParams();
    const navigate = useNavigate();

    const listingId = params?.listingid;

    const [reloadData, setReloadData] = useRecoilState(reloadFolderListingState);
    const [itemList, setItemList] = useState([]);
    const [tempItemList, setTempItemList] = useState([]);
    const [parentFolder, setParentFolder] = useState(null);

    const loginData = useRecoilValue(loginState);
    const [loading, setLoading] = useRecoilState(contentLoadingState);

    const globalFilterQuery = useRecoilValue(filterQueryState);

    useDynamicFilter(true);
    useCurrentRoute("/streaming");

    const doActualFilter = useCallback((query) => {
        const filteredItems = tempItemList.filter(item => {
            return item.listingName.toLowerCase().includes(query.toLowerCase());
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
        ApiService.get("/api/v1/listing/folder/stream/list", loginData?.token, navigate)
            .then(data => {
                setItemList(data?.message?.items);
                setTempItemList(data?.message?.items);
                setParentFolder(data?.message?.parentFolder);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch data");
            }).finally(() => {
                setLoading(false);
                setReloadData(false);
            });
    }, [listingId, reloadData, loginData?.token, setReloadData, setLoading, navigate]);

    return (
        <>
            <Helmet>
                <title>Folder Listing - {parentFolder ? parentFolder.listingName : "Root"}</title>
            </Helmet>

            <Breadcrumb type="front" pageTitle={"Stream Hub"} breadcrumbList={null} />

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
                                            <SingleFeed videoItem={item} />
                                        </motion.div>
                                    );
                                })
                            }
                        </div> :
                        !loading && <NoListing mainText="Oops! Nothing to List here" subText="Please add some streaming link first!" buttonText="Go to home" buttonLink="/" displayIcon={<FaCameraRetro />} />
                }
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(StreamListing);
export default MemoizedComponent;
