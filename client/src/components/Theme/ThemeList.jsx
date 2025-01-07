import React, { useCallback } from 'react';
import { Helmet } from "react-helmet";
import { motion } from 'framer-motion';
import { GiNotebook } from "react-icons/gi";
import ApiService from '../../utils/ApiService';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { colorThemeState, loadingState, loginState } from '../../atoms';
import DeletePageModal from '../Modals/DeletePageModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import ManagePublishPageModal from '../Modals/ManagePublishPageModal';
import SingleThemeItem from './SingleThemeItem';
import NoListing from '../Misc/NoListing';
import SystemThemes from '../../utils/SystemThemes';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const PageList = () => {
  useDynamicFilter(false);
  useCurrentRoute("/manage/theme");

  const navigate = useNavigate();

  const [colorTheme, setColorTheme] = useRecoilState(colorThemeState);
  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);

  const onSelect = useCallback((selectedTheme) => {
    const theme = selectedTheme.value;

    if (theme === colorTheme) {
      console.log("Theme already selected", theme, colorTheme);
      return;
    }

    setColorTheme(theme);

    setLoading(true);
    ApiService.post("/api/v1/settings/theme", { colorTheme: theme }, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Theme saved successfully.");
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Theme could not be saved.");
      }).finally(() => {
        setLoading(false);
      });
  }, [colorTheme, loginData, setColorTheme, setLoading, navigate]);

  return (
    <>
      <DeletePageModal />
      <ManagePublishPageModal />
      <Helmet>
        <title>Themes</title>
      </Helmet>

      <Breadcrumb
        type="custom"
        pageTitle="Themes"
        breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]}
      />

      <div className="flex flex-col justify-between">
        <div className="text-left w-full md:w-auto" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full mt-4"
      >
        <div className="space-y-4 w-full mt-4">
          {SystemThemes?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {SystemThemes.map((singleTheme, index) => (
                <div key={index} className="relative">
                  <SingleThemeItem
                    theme={singleTheme}
                    onSelect={onSelect}
                    isCurrentTheme={colorTheme === singleTheme.value}
                  />
                </div>
              ))}
            </div>
          ) : (
            <NoListing
              mainText="Oops! Nothing to List here"
              subText="Please add some theme first"
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

const MemoizedComponent = React.memo(PageList);
export default MemoizedComponent;