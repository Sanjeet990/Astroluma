import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { motion } from 'framer-motion';
import { GiNotebook } from "react-icons/gi";
import ApiService from '../../utils/ApiService';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { changedPageState, deletePageModalState, loadingState, loginState, publishPageModalState } from '../../atoms';
import DeletePageModal from '../Modals/DeletePageModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import ManagePublishPageModal from '../Modals/ManagePublishPageModal';
import SinglePageItem from './SinglePageItem';
import NoListing from '../Misc/NoListing';
import makeToast from '../../utils/ToastUtils';
import NiceLink from '../NiceViews/NiceLink';
import { useNavigate } from 'react-router-dom';

const PageList = () => {

  const navigate = useNavigate();

  const [pageList, setPageList] = useState([]);

  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);

  const setPageDelete = useSetRecoilState(deletePageModalState);
  const setPublishPageModal = useSetRecoilState(publishPageModalState);
  const [changedPage, setChangedPage] = useRecoilState(changedPageState);

  useDynamicFilter(false);
  useCurrentRoute("/manage/page");

  useEffect(() => {
    setLoading(true);
    ApiService.get("/api/v1/page/list", loginData?.token, navigate)
      .then(data => {
        setPageList(data?.message);
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Error loading data...");
      }).finally(() => {
        setLoading(false);
      });
  }, [loginData?.token, setLoading, changedPage, navigate]);

  useEffect(() => {
    setChangedPage(null);
  });


  const deletePage = (pageId) => {
    setPageDelete({ isOpen: true, data: { pageId } });
  }

  const managePublish = (pageId, isPublished) => {
    setPublishPageModal({ isOpen: true, data: { pageId, isPublished } });
  }

  return (
    <>
      <DeletePageModal />
      <ManagePublishPageModal />
      <Helmet>
        <title>Pages</title>
      </Helmet>

      <Breadcrumb type="custom" pageTitle={"Pages"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

      <div className="flex flex-col justify-between">
        <div className="text-left w-full md:w-auto" />
        <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
          <NiceLink label="Add Page"
            className="bg-buttonGeneric text-buttonText"
            to="/manage/page/add" />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full mt-4"
      >
        <div className="space-y-4 w-full">
          {pageList?.length > 0 ? (
            <>
              {
                pageList.map(page => (
                  <SinglePageItem key={page._id} page={page} deletePage={deletePage} managePublish={managePublish} />
                ))
              }
            </>
          ) : (
            <NoListing mainText="Oops! Nothing to List here" subText="Please create some pages first" buttonText="Go to home" buttonLink="/" displayIcon={<GiNotebook />} />
          )}
        </div>
      </motion.div>
    </>
  );
};

const MemoizedComponent = React.memo(PageList);
export default MemoizedComponent;