import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import {
  authListState,
  colorThemeState,
  homepageItemState,
  iconPackState,
  isHostModeState,
  loadingState,
  loginState,
  reloadDashboardDataState,
  sidebarItemState,
  siteDataLoadedState,
  userDataState
} from '../../atoms';
import ApiService from '../../utils/ApiService';
import makeToast from '../../utils/ToastUtils';

const PrivateRoute = () => {
  const navigate = useNavigate();

  const setLoading = useSetRecoilState(loadingState);

  const loginData = useRecoilValue(loginState);

  const [reloadData, setReloadData] = useRecoilState(reloadDashboardDataState);

  const [authList, setAuthList] = useRecoilState(authListState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [sidebarItems, setSidebarItems] = useRecoilState(sidebarItemState);
  const [homepageItems, setHomepageItems] = useRecoilState(homepageItemState);
  const [iconPacks, setIconPacks] = useRecoilState(iconPackState);
  const setColorTheme = useSetRecoilState(colorThemeState);
  const setHostMode = useSetRecoilState(isHostModeState);
  const setDataLoaded = useSetRecoilState(siteDataLoadedState);

  const isDataMissing = !authList?.length ||
    !userData ||
    !sidebarItems?.length ||
    !homepageItems?.length ||
    !iconPacks?.length;

  useEffect(() => {
    if ((reloadData || isDataMissing) && loginData?.token) {
      setDataLoaded(false);
      setLoading(true);

      ApiService.get("/api/v1/dashboard", loginData ? loginData?.token : null, navigate)
        .then(data => {
          setAuthList(data?.message?.authenticators);
          setUserData(data?.message?.userData);
          setSidebarItems(data?.message?.sidebarItems);
          setHomepageItems(data?.message?.homepageItems);
          setIconPacks(data?.message?.iconPacks);
          setHostMode(data?.message?.isHostMode);

          const theme = data?.message?.userData?.colorTheme;

          setColorTheme(theme);
          setDataLoaded(true);
        })
        .catch(error => {
          if (!error.handled) makeToast("error", "Error loading data...");
        })
        .finally(() => {
          setLoading(false);
          setReloadData(false);
        });
    }
  }, [loginData, reloadData, navigate, setLoading, setAuthList, setUserData, setSidebarItems,
    setHomepageItems, setColorTheme, setReloadData, setIconPacks, setHostMode, isDataMissing, setDataLoaded]);

  return loginData?.token ? <Outlet /> : <Navigate to="/login" />;
};


const MemoizedComponent = React.memo(PrivateRoute);
export default MemoizedComponent;