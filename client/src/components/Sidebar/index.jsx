import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { motion } from 'framer-motion';
import { BsAppIndicator } from "react-icons/bs";
import { MdOutlineImportantDevices, MdSmartDisplay, MdFace, MdMenuBook, MdListAlt, MdDashboardCustomize } from "react-icons/md";
import { FaGlobeAsia, FaRegListAlt, FaHome, FaCloudSunRain, FaTshirt } from "react-icons/fa";
import { IoSettingsSharp, IoQrCode } from "react-icons/io5";
import SidebarButtonItem from './SidebarButtonItem';
import SidebarLinkItem from './SidebarLinkItem';
import { isLocal } from '../../utils/Helper';
import PropTypes from 'prop-types';
import { activeRouteState, authenticatorPanelState, sidebarItemState, userDataState, sidebarExpandedState } from '../../atoms';
import packageJson from '../../../package.json';
import BuyMeACoffee from '../BuyMeACoffee';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const sidebarItems = useRecoilValue(sidebarItemState);
  const userData = useRecoilValue(userDataState);
  const activeRoute = useRecoilValue(activeRouteState);
  const [showAuthenticator, setShowAuthenticator] = useRecoilState(authenticatorPanelState);

  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const [storedSidebarExpanded, setStoredSidebarExpanded] = useRecoilState(sidebarExpandedState);

  const [sidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target))
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    setStoredSidebarExpanded(sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded, setStoredSidebarExpanded]);

  const decideTheLink = (singleItem) => {
    // Check the hostname
    const hostname = window.location.hostname;

    let url = singleItem.listingUrl;

    if (singleItem.listingType === "category") {
      url = `/c/${singleItem._id}`;
    } else if (singleItem.listingType === "todo") {
      url = `/t/${singleItem._id}`;
    } else if (singleItem.listingType === "snippet") {
      url = `/s/${singleItem._id}`;
    } else {
      if (isLocal(hostname)) {
        url = singleItem.localUrl || singleItem.listingUrl;
      } else {
        url = singleItem.listingUrl;
      }
    }
    return url;
  }

  const openAuthenticator = () => {
    setShowAuthenticator(!showAuthenticator);
  }

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-40 flex h-screen w-72.5 flex-col overflow-y-hidden bg-sidebarBg text-sidebarText duration-300 ease-linear lg:static lg:translate-x-0 drop-shadow-1 dark:drop-shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >

      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link to="/" className="flex flex-col items-center">
            <div className="flex items-start">
              <img width="32" src='/astroluma.svg' alt="Logo" className="mr-2 mt-1" />
              <div className="flex flex-col items-left">
                <span className='text-2xl Orbitron'>{userData?.siteName || "Astroluma"}</span>
                <span className="text-xxs">Powered by Astroluma v{packageJson.version}</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>

            <ul className="mb-6 flex flex-col gap-1.5">
              {
                !pathname.startsWith('/manage') ?
                  sidebarItems?.map((singleItem) => {
                    const route = decideTheLink(singleItem);
                    const isActive = route === activeRoute ? true : false;

                    const icon = route === "/" ? <FaHome /> : <BsAppIndicator />;
                    return <SidebarLinkItem
                      key={singleItem?._id}
                      active={isActive}
                      icon={icon}
                      text={singleItem?.listingName}
                      to={route} />
                  })
                  :
                  <>
                    <SidebarLinkItem
                      icon={<MdDashboardCustomize />}
                      active={activeRoute === '/manage'}
                      text="Dashboard"
                      to="/manage" />

                    <SidebarLinkItem
                      icon={<IoSettingsSharp />}
                      active={activeRoute === '/manage/general'}
                      text="General Settings"
                      to="/manage/general" />

                    <SidebarLinkItem
                      icon={<MdListAlt />}
                      active={activeRoute === '/manage/listing'}
                      text="Listings"
                      to="/manage/listing" />

                    <SidebarLinkItem
                      icon={<MdMenuBook />}
                      text="Pages"
                      active={activeRoute === '/manage/page'}
                      to="/manage/page" />

                    <SidebarLinkItem
                      icon={<FaCloudSunRain />}
                      text="Weather"
                      active={activeRoute === '/manage/weather'}
                      to="/manage/weather" />

                    <SidebarLinkItem
                      icon={<FaTshirt />}
                      text="Themes"
                      active={activeRoute === '/manage/theme'}
                      to="/manage/theme" />

                    {
                      userData?.camerafeed && <SidebarLinkItem
                        icon={<MdSmartDisplay />}
                        active={activeRoute === '/manage/streaming'}
                        text="Stream Hub"
                        to="/manage/streaming" />
                    }

                    {
                      userData?.networkdevices && <SidebarLinkItem
                        icon={<MdOutlineImportantDevices />}
                        text="Network Devices"
                        active={activeRoute === '/manage/networkdevices'}
                        to="/manage/networkdevices" />
                    }

                    {
                      userData?.authenticator && <SidebarLinkItem
                        icon={<IoQrCode />}
                        text="TOTP Authenticator"
                        active={activeRoute === '/manage/totp'}
                        to="/manage/totp" />
                    }

                    <SidebarLinkItem
                      icon={<BsAppIndicator />}
                      text="App Integrations"
                      active={activeRoute === '/manage/apps'}
                      to="/manage/apps" />

                    <SidebarLinkItem
                      icon={<MdFace />}
                      text="User Accounts"
                      active={activeRoute === '/manage/accounts'}
                      to="/manage/accounts" />

                  </>
              }
            </ul>

            {
              !pathname.startsWith('/manage') && <>
                <h3 className="mb-4 ml-4 text-sm">Features</h3>

                <ul className="mb-6 flex flex-col gap-1.5">

                  <SidebarLinkItem
                    icon={<IoSettingsSharp />}
                    active={false}
                    text="Settings"
                    to="/manage" />

                  {
                    userData?.camerafeed && <SidebarLinkItem
                      icon={<MdSmartDisplay />}
                      active={pathname === '/streaming'}
                      text="Stream Hub"
                      to="/streaming" />
                  }

                  {
                    userData?.networkdevices && <SidebarLinkItem
                      icon={<IoQrCode />}
                      active={pathname === '/networkdevices'}
                      text="Network Devices"
                      to="/networkdevices" />
                  }

                  {
                    userData?.todolist && <SidebarLinkItem
                      icon={<FaRegListAlt />}
                      active={pathname === '/tasks'}
                      text="Tasks"
                      to="/tasks" />
                  }

                  {
                    activeRoute === '/page' && <SidebarButtonItem
                      id="page"
                      icon={<FaGlobeAsia />}
                      active
                      text="Pages"
                    />
                  }

                  {
                    userData?.authenticator && <SidebarButtonItem
                      id="btnAuth"
                      icon={<IoQrCode />}
                      active={pathname === '/authenticator'}
                      text="TOTP Authenticator"
                      clickHandler={openAuthenticator}
                    />
                  }

                </ul>
              </>
            }
          </div>
        </nav>
      </div>
      {
        pathname.startsWith('/manage') && <div className="mt-auto p-4 text-center text-xs">
          <BuyMeACoffee />
        </div>
      }
    </aside>
  );
};

Sidebar.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired
}

export default Sidebar;
