import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DropdownUser from './DropdownUser';
import { IoHomeSharp, IoQrCode } from "react-icons/io5";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authenticatorPanelState, filterQueryState, isFilterVisibleState, isHostModeState, userDataState } from '../../atoms';
import { motion } from 'framer-motion';
import { FaRegListAlt } from "react-icons/fa";
import { MdOutlineImportantDevices, MdSmartDisplay } from "react-icons/md";
import PropTypes from 'prop-types';

const Header = (props) => {

  const navigate = useNavigate();

  const isFilterVisible = useRecoilValue(isFilterVisibleState);
  const setDebouncedFilterValue = useSetRecoilState(filterQueryState);

  const isHostMode = useRecoilValue(isHostModeState);

  const [filterValue, setFilterValue] = useState("");

  const [showAuthenticator, setShowAuthenticator] = useRecoilState(authenticatorPanelState);
  const inputRef = useRef(null);

  const userData = useRecoilValue(userDataState);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterValue(filterValue);
    }, 600);

    return () => {
      clearTimeout(handler);
    };
  }, [filterValue, setDebouncedFilterValue]);


  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if the key is a printable character
      const isPrintableCharacter = event?.key?.length === 1;

      // Check if any input element is focused
      const focused = document.activeElement.tagName.toLowerCase();

      if (isPrintableCharacter && focused !== 'input' && focused !== 'textarea') {
        // If a printable character is pressed and no input element is focused, focus the input field
        inputRef?.current?.focus();
      }
    };

    // Attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // Detach the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);


  const openAuthenticator = () => {
    setShowAuthenticator(!showAuthenticator);
  }

  const openCameraFeed = () => {
    navigate("/streaming");
  }

  const openDevices = () => {
    navigate("/networkdevices");
  }

  const openTasks = () => {
    navigate("/tasks");
  }

  return (
    <header className="sticky top-0 z-999 flex w-full bg-headerBg text-headerText">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm bg-transparent p-1.5 lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-[0] duration-200 ease-in-out bg-headerText ${!props.sidebarOpen && '!w-full delay-300'
                    }`} />
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-150 duration-200 ease-in-out bg-headerText ${!props.sidebarOpen && 'delay-400 !w-full'
                    }`} />
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-200 duration-200 ease-in-out bg-headerText ${!props.sidebarOpen && '!w-full delay-500'
                    }`} />
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm delay-300 duration-200 ease-in-out bg-headerText ${!props.sidebarOpen && '!h-0 !delay-[0]'
                    }`} />
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm duration-200 ease-in-out bg-headerText ${!props.sidebarOpen && '!h-0 !delay-200'
                    }`} />
              </span>
            </span>
          </button>

          <Link className="block flex-shrink-0 lg:hidden text-headerText hover:text-headerHoverText" to="/">
            <IoHomeSharp size={22} />
          </Link>
        </div>

        <div className="hidden sm:block">
          {
            isFilterVisible &&
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                {/* Search Icon SVG */}
              </button>

              <input
                type="text"
                ref={inputRef}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-10 text-headerSearchText placeholder-headerSearchHintText focus:outline-none xl:w-125"
              />

              {filterValue && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 px-2"
                  onClick={() => setFilterValue('')}
                  type="button"
                >
                  <svg
                    className="fill-current text-headerText hover:headerHoverText"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M15 5L5 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          }
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {
              userData?.camerafeed && <motion.div
                className="cursor-pointer text-headerText hover:text-headerHoverText"
                onClick={openCameraFeed}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.2 }}
              >
                <MdSmartDisplay size={26} />
              </motion.div>
            }
            {
              (userData?.networkdevices && isHostMode) && <motion.div
                className="cursor-pointer text-headerText hover:text-headerHoverText"
                onClick={openDevices}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.2 }}
              >
                <MdOutlineImportantDevices size={22} />
              </motion.div>
            }
            {
              userData?.todolist && <motion.div
                className="cursor-pointer text-headerText hover:text-headerHoverText"
                onClick={openTasks}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.2 }}
              >
                <FaRegListAlt size={22} />
              </motion.div>
            }
            {
              userData?.authenticator && <motion.div
                className="cursor-pointer text-headerText hover:text-headerHoverText"
                onClick={openAuthenticator}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.2 }}
              >
                <IoQrCode size={22} />
              </motion.div>
            }
          </ul>

          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func
};

const MemoizedComponent = React.memo(Header);
export default MemoizedComponent;
