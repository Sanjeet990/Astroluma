import './App.css';
import { useRecoilValue } from 'recoil';
import { colorThemeState } from './atoms';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Helmet } from "react-helmet"
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Loader from './components/Layout/Loader';
import PrivateRoute from './components/Layout/PrivateRoute';
import Settings from './components/Settings/Settings';
import Listings from './components/Listing/Listings';
import NotFound from './components/Misc/NotFound';
import EditFolder from './components/Listing/EditFolder';
import EditLink from './components/Listing/EditLink';
import CategoryListing from './components/Listing/CategoryListing';
import TodoListing from './components/Todo/TodoListing';
import EditTodo from './components/Todo/EditTodo';
import AppListing from './components/Integration/AppListing';
import InstalledApps from './components/Integration/InstalledApps';
import EditStream from './components/Listing/EditStream';
import StreamListing from './components/Listing/StreamListing';
import WakeListings from './components/Networkdevice/WakeListings';
import EditDevice from './components/Networkdevice/EditDevice';
import WakeFrontListing from './components/Networkdevice/WakeFrontListing';
import NetworkError from './components/Misc/NetworkError';
import ContentLoader from './components/Layout/ContentLoader';
import AccountList from './components/Accounts/AccountList';
import EditUser from './components/Accounts/EditUser';
import ClientError from './components/Misc/ClientError';
import PageList from './components/Page/PageList';
import EditPage from './components/Page/EditPage';
import ViewPage from './components/Page/ViewPage';
import ImageSelectorModal from './components/Modals/ImageSelectorModal';
import AuthenticatorListing from './components/Authenticator/AuthenticatorListing';
import EditAuthenticator from './components/Authenticator/EditAuthenticator';
import SnippetListing from './components/Snippet/SnippetListing';
import EditSnippetList from './components/Snippet/EditSnippetList';
import ThemeList from './components/Theme/ThemeList';
import WeatherSettings from './components/Settings/WeatherSettings';
import GeneralSettings from './components/Settings/GeneralSettings';

import SystemThemes from './utils/SystemThemes';

const App = () => {
  const [themeType, setThemeType] = useState("dark");
  const [accentColor, setAccentColor] = useState("#f5f5f5");

  const colorTheme = useRecoilValue(colorThemeState)

  useEffect(() => {

    setThemeType(SystemThemes.find(theme => theme.value === colorTheme)?.type || "dark");
    setAccentColor(SystemThemes.find(theme => theme.value === colorTheme)?.accentColor || "#f5f5f5");
    const root = window.document.documentElement;
    const currentClass = root.classList.item(0);
    if (currentClass) {
      root.classList.replace(currentClass, colorTheme);
    } else {
      root.classList.add(colorTheme);
    }
  }, [colorTheme]);

  const NotFoundRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
      navigate('/notfound');
    }, [navigate]);

    return null;
  };

  return (
    <Loader>
      <ToastContainer style={{ zIndex: 100000 }} theme={themeType} />
      
      <ImageSelectorModal title="Select icon" />

      <BrowserRouter>
        <Helmet>
          <title>Dashboard : Astroluma</title>
          <meta name="theme-color" content={accentColor} />
        </Helmet>
        <div className="bg-bodyBg text-bodyText">
          <div className="flex h-screen overflow-hidden">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <ContentLoader>
                      <div className="flex-grow flex flex-col p-4">
                        <Routes>
                          <Route exact path='/' element={<PrivateRoute />}>
                            <Route key={Math.random()} path="/" element={<CategoryListing />} />
                            <Route key={Math.random()} path="/c/:listingid" element={<CategoryListing />} />
                            <Route key={Math.random()} path="/t/:listingid" element={<TodoListing />} />
                            <Route key={Math.random()} path="/s/:listingid" element={<SnippetListing />} />
                            <Route key={Math.random()} path="/p/:pageId" element={<ViewPage />} />
                            <Route key={Math.random()} path="/page" element={<CategoryListing />} />
                            <Route key={Math.random()} path="/tasks" element={<TodoListing />} />
                            <Route key={Math.random()} path="/streaming" element={<StreamListing />} />
                            <Route key={Math.random()} path="/snippet" element={<SnippetListing />} />
                            <Route key={Math.random()} path="/networkdevices" element={<WakeFrontListing />} />
                            <Route key={Math.random()} path="/manage" element={<Settings />} />
                            <Route key={Math.random()} path="/manage/apps" element={<InstalledApps />} />
                            <Route key={Math.random()} path="/manage/apps/all" element={<AppListing />} />
                            <Route key={Math.random()} path="/manage/listing" element={<Listings type="listing" />} />
                            <Route key={Math.random()} path="/manage/streaming" element={<Listings type="streaming" />} />
                            <Route key={Math.random()} path="/manage/listing/save/folder" element={<EditFolder />} />
                            <Route key={Math.random()} path="/manage/listing/save/folder/:listingid" element={<EditFolder />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/folder" element={<EditFolder />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/folder/:listingid" element={<EditFolder />} />
                            <Route key={Math.random()} path="/manage/listing/save/link" element={<EditLink />} />
                            <Route key={Math.random()} path="/manage/listing/save/link/:listingid" element={<EditLink />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/link" element={<EditLink />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/link/:listingid" element={<EditLink />} />
                            <Route key={Math.random()} path="/manage/listing/save/todo" element={<EditTodo />} />
                            <Route key={Math.random()} path="/manage/listing/save/todo/:listingid" element={<EditTodo />} />
                            <Route key={Math.random()} path="/manage/listing/save/snippet" element={<EditSnippetList />} />
                            <Route key={Math.random()} path="/manage/listing/save/snippet/:listingid" element={<EditSnippetList />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/todo" element={<EditTodo />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/todo/:listingid" element={<EditTodo />} />
                            <Route key={Math.random()} path="/manage/listing/save/stream" element={<EditStream />} />
                            <Route key={Math.random()} path="/manage/listing/save/stream/:listingid" element={<EditStream />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/stream" element={<EditStream />} />
                            <Route key={Math.random()} path="/manage/listing/:parentid/save/stream/:listingid" element={<EditStream />} />
                            <Route key={Math.random()} path="/manage/listing/:listingid" element={<Listings type="listing" />} />
                            <Route key={Math.random()} path="/manage/networkdevices" element={<WakeListings />} />
                            <Route key={Math.random()} path="/manage/networkdevices/save" element={<EditDevice />} />
                            <Route key={Math.random()} path="/manage/networkdevices/save/:deviceId" element={<EditDevice />} />
                            <Route key={Math.random()} path="/manage/accounts" element={<AccountList />} />
                            <Route key={Math.random()} path="/manage/accounts/add" element={<EditUser />} />
                            <Route key={Math.random()} path="/manage/accounts/:userId" element={<EditUser />} />
                            <Route key={Math.random()} path="/manage/page" element={<PageList />} />
                            <Route key={Math.random()} path="/manage/general" element={<GeneralSettings />} />
                            <Route key={Math.random()} path="/manage/theme" element={<ThemeList />} />
                            <Route key={Math.random()} path="/manage/weather" element={<WeatherSettings />} />
                            <Route key={Math.random()} path="/manage/page/add" element={<EditPage />} />
                            <Route key={Math.random()} path="/manage/page/:pageId" element={<EditPage />} />
                            <Route key={Math.random()} path="/manage/totp" element={<AuthenticatorListing />} />
                            <Route key={Math.random()} path="/manage/totp/save" element={<EditAuthenticator />} />
                            <Route key={Math.random()} path="/manage/totp/save/:authId" element={<EditAuthenticator />} />
                            <Route path="*" element={<NotFoundRedirect />} />
                          </Route>
                        </Routes>
                      </div>
                    </ContentLoader>
                  </Layout>
                } />
              <Route path="/notfound" element={<NotFound />} />
              <Route path="/client-error" element={<ClientError />} />
              <Route path="/server-error" element={<NotFound />} />
              <Route path="/network-error" element={<NetworkError />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </Loader >
  );
}

export default App;
