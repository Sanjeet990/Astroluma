import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const authStyle = searchParams.get("authStyle") || "header"; // Can be 'header' or 'params'

  const setLoading = useSetRecoilState(loadingState);
  const [loginData, setLoginData] = useRecoilState(loginState);

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

  // Handle OIDC code validation
  useEffect(() => {
    const validateOIDCCode = async () => {
      if (code && !loginData?.token) {
        setLoading(true);
        //makeToast("info", "Validating user...");

        try {
          let response;
          response = await ApiService.post(
            "/api/v1/login/oidc/validate",
            { code },
            null,
            navigate
          );

          if (response?.message?.token) {
            setLoginData({
              token: response.message.token,
              user: response.message.user
            });

            // Clean up URL params
            navigate("/");
          } else {
            makeToast("error", "Invalid authentication code");
            navigate("/login");
          }
        } catch (error) {
          if (!error.handled) {
            makeToast("error", error?.response?.data?.message || "Error validating authentication code");
          }
          navigate("/login");
        } finally {
          setLoading(false);
        }
      }
    };

    validateOIDCCode();
  }, [code, navigate, setLoginData, setLoading, loginData?.token, authStyle]);

  // Load dashboard data
  useEffect(() => {
    if ((reloadData || isDataMissing) && loginData?.token) {
      setDataLoaded(false);
      setLoading(true);

      ApiService.get("/api/v1/dashboard", loginData.token, navigate)
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

  return loginData?.token ? <Outlet /> : code ? <></> : <Navigate to="/login" />;
};

const MemoizedComponent = React.memo(PrivateRoute);
export default MemoizedComponent;