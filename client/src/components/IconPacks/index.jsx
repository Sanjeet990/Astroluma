import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { motion } from 'framer-motion';
import { GiNotebook } from "react-icons/gi";
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { iconPackState, loadingState, loginState } from '../../atoms';
import DeletePageModal from '../Modals/DeletePageModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import ManagePublishPageModal from '../Modals/ManagePublishPageModal';
import SingleIconPackItem from './SingleIconPackItem';
import NoListing from '../Misc/NoListing';
import makeToast from '../../utils/ToastUtils';
import NiceLink from '../NiceViews/NiceLink';

const IconPacks = () => {
  useDynamicFilter(false);
  useCurrentRoute("/manage/iconpack");

  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);
  const [allIconPacks, setAllIconPacks] = useState([]);

  const setIconPackState = useSetRecoilState(iconPackState);

  const fetchIconPacks = useCallback(() => {
    setLoading(true);
    ApiService.get("/api/v1/iconpack/list", loginData?.token)
      .then((response) => {
        setAllIconPacks(() => response?.message);
        setIconPackState(() => response?.message);
      })
      .catch((error) => {
        makeToast("error", error?.response?.data?.message);
      }).finally(() => {
        setLoading(false);
      });
  }, [loginData, setLoading, setIconPackState]);

  useEffect(() => {
    fetchIconPacks();
  }, [fetchIconPacks]);

  const deleteListener = useCallback(() => {
    fetchIconPacks();
  }, [fetchIconPacks]);

  return (
    <>
      <DeletePageModal />
      <ManagePublishPageModal />
      <Helmet>
        <title>Icon Packs</title>
      </Helmet>

      <Breadcrumb
        type="custom"
        pageTitle="Icon Packs"
        breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]}
      />

      <div className="flex flex-col justify-between">
        <div className="text-left w-full md:w-auto" />
        <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
          <NiceLink
            label='Add Icon Pack'
            to="/manage/iconpack/add"
            className="bg-buttonGeneric text-buttonText"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full mt-4"
      >
        <div className="space-y-4 w-full mt-4">
          {allIconPacks?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {
                allIconPacks.map((singlePack, index) => (
                  <div key={index} className="relative">
                    <SingleIconPackItem
                      iconPack={singlePack}
                      deleteListener={deleteListener}
                    />
                  </div>
                ))
              }
            </div>
          ) : (
            <NoListing
              mainText="Oops! Nothing to List here"
              subText="Please add some icon packs first"
              buttonText="Go to home"
              buttonLink="/"
              displayIcon={<GiNotebook />}
            />
          )}
        </div>
      </motion.div>
    </>
  );
};

const MemoizedComponent = React.memo(IconPacks);
export default MemoizedComponent;