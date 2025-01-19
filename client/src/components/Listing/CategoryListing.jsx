import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { contentLoadingState, filterQueryState, loginState, reloadFolderListingState, userDataState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import SingleListingInFront from './SingleListingInFront';
import { Helmet } from "react-helmet"
import { motion } from 'framer-motion';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import WelcomeHeader from '../Header/WelcomeHeader';
import NoListing from '../Misc/NoListing';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import { FaLink } from "react-icons/fa";
import makeToast from '../../utils/ToastUtils';

const CategoryListing = () => {
    const params = useParams();
    const navigate = useNavigate();

    const listingId = params?.listingid;

    const [reloadData, setReloadData] = useRecoilState(reloadFolderListingState);
    const [itemList, setItemList] = useState([]);
    const [tempItemList, setTempItemList] = useState([]);
    const [breadcrumbList, setBreadcrumbList] = useState([]);
    const [parentFolder, setParentFolder] = useState(null);

    const loginData = useRecoilValue(loginState);
    const [loading, setLoading] = useRecoilState(contentLoadingState);

    const setActiveRoute = useCurrentRoute();

    const userData = useRecoilValue(userDataState);

    const globalFilterQuery = useRecoilValue(filterQueryState);

    useDynamicFilter(true);
    
    useEffect(() => {
        if (listingId) {
            setActiveRoute(`/c/${listingId}`);
        } else {
            setActiveRoute("/");
        }
    }, [listingId, setActiveRoute]);

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
        if (breadcrumbList.length > 0) {
            setActiveRoute(`/c/${breadcrumbList[0]?._id}`);
        } else {
            if (listingId) setActiveRoute(`/c/${listingId}`);
            else setActiveRoute("/");
        }
    }, [breadcrumbList, listingId, setActiveRoute]);


    useEffect(() => {
        setLoading(true);
        ApiService.get(`/api/v1/listing/folder/${listingId}/list`, loginData?.token, navigate)
            .then(data => {
                setItemList(data?.message?.items);
                setTempItemList(data?.message?.items);
                setParentFolder(data?.message?.parentFolder);
                setBreadcrumbList(data?.message?.breadcrumb);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch folder listing.");
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

            {
                !parentFolder ?
                    <WelcomeHeader />
                    :
                    <Breadcrumb type="front" pageTitle={parentFolder?.listingName} breadcrumbList={breadcrumbList} />
            }

            <div className="mt-4">
                {
                    itemList?.length > 0 ?
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
                                            <SingleListingInFront item={item} />
                                        </motion.div>
                                    );
                                })
                            }
                        </div> :
                        !loading && <NoListing mainText="Oops! Nothing to List here" subText="Please create some folder or links first" buttonText="Go to home" buttonLink="/" displayIcon={<FaLink />} />
                }
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(CategoryListing);
export default MemoizedComponent;
