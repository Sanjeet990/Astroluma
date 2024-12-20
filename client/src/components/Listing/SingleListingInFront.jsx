import React, { useEffect, useRef, useState } from 'react';
import ImageView from '../Misc/ImageView';
import { FiCopy } from 'react-icons/fi';
import { isLocal } from '../../utils/Helper';
import useSecurityCheck from "../../hooks/useSecurityCheck";
import { ImNewTab } from "react-icons/im";
import { Link } from 'react-router-dom';
import ApiService from '../../utils/ApiService';
import { useRecoilValue } from 'recoil';
import { loginState } from '../../atoms';
import { motion, AnimatePresence } from 'framer-motion';
import NiceButton from '../NiceViews/NiceButton';
import { GrAppsRounded, GrClose } from "react-icons/gr";
import makeToast from '../../utils/ToastUtils';
import PropTypes from 'prop-types';

const SingleListingInFront = (props) => {

    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);

    const [showLinkCopy, setShowLinkCopy] = useState(false);
    const isSecure = useSecurityCheck();
    const totalTime = 15;
    const [timeLeft, setTimeLeft] = useState(0);
    const [htmlData, setHtmlData] = useState(null);
    const [fullHtmlData, setFullHtmlData] = useState(null);
    const [background, setBackground] = useState(null);
    const [alwaysShowDetailedView, setAlwaysShowDetailedView] = useState(false);
    const [showAppsDataForSmallerScreen, setShowAppsDataForSmallerScreen] = useState(false);

    const loginData = useRecoilValue(loginState);

    const decideTheLink = () => {
        // Check the hostname
        const hostname = window.location.hostname;

        let url = props.item.listingUrl;

        if (props.item.listingType === "category") {
            url = `/c/${props.item._id}`;
        } else if (props.item.listingType === "todo") {
            url = `/t/${props.item._id}`;
        } else if (props.item.listingType === "snippet") {
            url = `/s/${props.item._id}`;
        } else {
            if (isLocal(hostname)) {
                url = `${props.item.localUrl ? props.item.localUrl : props.item.listingUrl}`;
            } else {
                url = `${props.item.listingUrl ? props.item.listingUrl : props.item.localUrl}`;
            }
        }
        return url;
    }

    const copyLinkTextToClipboard = (e) => {
        e.preventDefault();
        showCopyDisplays();
    }

    const openThisLinkInNewTab = (e) => {
        e.preventDefault();

        const linkToVisit = decideTheLink();
        window.open(linkToVisit, '_blank');
    }

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        };

        // Store ref value in a variable inside the effect
        const currentRef = containerRef.current;

        const resizeObserver = new ResizeObserver(updateWidth);
        if (currentRef) {
            resizeObserver.observe(currentRef);
        }

        updateWidth(); // Initial width update

        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
        };
    }, []);

    useEffect(() => {
        let intervalId;

        const fetchData = () => {
            //console.log("Running Integration: ", props?.item?.integration);
            if (props.item.integration) {
                ApiService.get(`/api/v1/app/run/${props?.item?.integration?._id}/${props.item._id}`, loginData?.token)
                    .then(data => {
                        setHtmlData(data?.html);
                        setFullHtmlData(data?.fullHtml);
                        setBackground(data?.background);
                        setAlwaysShowDetailedView(data?.alwaysShowDetailedView || false);
                    })
                    .catch(() => {
                        //No need to show error to the user, just consume it
                    })
            }
        };

        fetchData(); // Call the function immediately on component mount

        const refreshAfter = props?.item?.integration?.autoRefreshAfter || 60;
        if (refreshAfter && refreshAfter >= 1) {
            intervalId = setInterval(fetchData, refreshAfter * 1000); // Call the function every x seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId); // Clear the interval when the component unmounts
            }
        };
    }, [props.item, loginData?.token]);

    useEffect(() => {
        let timer = null;

        if ((showLinkCopy || showAppsDataForSmallerScreen) && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (!showLinkCopy || timeLeft === 0) {
            clearInterval(timer);
            if (showLinkCopy) setShowLinkCopy(false);
            else if (showAppsDataForSmallerScreen) setShowAppsDataForSmallerScreen(false);
        }

        return () => clearInterval(timer); // This is the cleanup function
    }, [showLinkCopy, showAppsDataForSmallerScreen, timeLeft]);

    const showCopyDisplays = () => {
        setShowLinkCopy(true);
        setTimeLeft(15);
    }

    const handleViewClose = (e) => {
        e.preventDefault();
        if (showLinkCopy) setShowLinkCopy(false);
        else if (showAppsDataForSmallerScreen) setShowAppsDataForSmallerScreen(false);
    }

    const selectText = (e) => {
        e.target.select();
        if (isSecure && navigator.clipboard) {
            navigator.clipboard.writeText(decideTheLink()).then(() => {
                makeToast("success", "Link copied to clipboard!");
            }).catch(err => {
                makeToast("error", 'Failed to copy: ', err);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = decideTheLink();
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                makeToast("success", "Link copied to clipboard!");
            } catch (err) {
                makeToast("error", 'Failed to copy: ', err);
            }
            document.body.removeChild(textArea);
        }
    }

    const linkCopyVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    };

    const showAppsData = (e) => {
        e.preventDefault();
        setShowAppsDataForSmallerScreen(true);
        setTimeLeft(15);
    }

    return (
        <div
            className="relative">
            <motion.div ref={containerRef} whileHover={{ scale: 1.03 }} className={`relative border-2 border-itemCardBorder bg-itemCardBg text-itemCardText ${(showLinkCopy || showAppsDataForSmallerScreen) ? '' : 'hover:border-itemCardHoverBorder hover:bg-itemCardHoverBg hover:text-itemCardHoverText'} pt-10 pb-10 rounded-xl shadow-md h-80 transition-all duration-300`} style={{ overflow: 'hidden' }} >

                {
                    (background && !showLinkCopy && !showAppsDataForSmallerScreen) && (
                        <div
                            style={{ overflow: 'hidden' }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundColor: 'transparent', backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }} />
                            <motion.div
                                className="absolute inset-0 bg-itemCardOverlayBg opacity-80"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ duration: 0.5 }} />
                        </div>
                    )
                }

                <AnimatePresence>
                    {
                        showLinkCopy ? (
                            <motion.div className="absolute inset-0 h-full flex flex-col items-center justify-center m-2"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={linkCopyVariants}
                            >
                                {
                                    (isSecure && navigator.clipboard)
                                        ?
                                        <p className="mb-2 text-center">Click to select and copy</p>
                                        :
                                        <p className="mb-2 text-center">Click to copy</p>
                                }
                                <input
                                    onClick={selectText}
                                    value={decideTheLink()}
                                    readOnly
                                    className="w-full m-4 text-center bg-itemCardCopyInputBg text-itemCardCopyInputText rounded-full p-2 pl-4 border border-itemCardCopyInputBorder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="mb-2 mt-4 text-center">Auto closes in <br />{timeLeft} seconds.</p>
                                <NiceButton
                                    label="Close"
                                    className="bg-itemCardButtonColor hover:bg-itemCardButtonHoverColor text-itemCardButtonTextColor hover:text-itemCardButtonHoverTextColor"
                                    onClick={handleViewClose}
                                />
                            </motion.div>
                        ) : (
                            showAppsDataForSmallerScreen ? (
                                <motion.div className="absolute inset-0 h-full flex flex-col items-center justify-center m-2"
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={linkCopyVariants}
                                >
                                    {/* skipcq: JS-0440 */}
                                    <div
                                        className='w-full items-center justify-center'
                                        dangerouslySetInnerHTML={{ __html: fullHtmlData || '' }}
                                    />
                                </motion.div>
                            ) :
                                <Link to={decideTheLink()} className='absolute inset-0 flex flex-col items-center justify-center'>
                                    <div className='p-8'>
                                        <ImageView alt="Link" src={props.item.listingIcon ? props.item.listingIcon : "/default.png"} defaultSrc="/default.png" errorSrc="/default.png" width="80px" height="80px" />
                                    </div>
                                    <div className='text-center overflow-hidden !min-h-20 !max-h-20 mt-2'>{props.item.listingName}</div>
                                </Link>
                        )
                    }
                </AnimatePresence>
                <div className='absolute top-0 right-2 flex space-x-2 p-4'>
                    {
                        (showLinkCopy || showAppsDataForSmallerScreen) && <span
                            role="button"
                            onClick={handleViewClose}
                            className="cursor-pointer opacity-50 hover:opacity-100 text-itemCardIconColor hover:text-itemCardIconHoverColor transition-all duration-300"
                        >
                            <GrClose size={20} />
                        </span>
                    }
                    {
                        (!showLinkCopy && !showAppsDataForSmallerScreen && props.item.listingType === "link" && props.item.integration && fullHtmlData && (width < 286 || alwaysShowDetailedView)) && <span
                            role="button"
                            onClick={showAppsData}
                            className="cursor-pointer opacity-50 hover:opacity-100 text-itemCardIconColor hover:text-itemCardIconHoverColor transition-all duration-300"
                        >
                            <GrAppsRounded size={20} />
                        </span>
                    }
                    {
                        (!showLinkCopy && !showAppsDataForSmallerScreen && props.item.listingType === "link") && <span
                            role="button"
                            onClick={copyLinkTextToClipboard}
                            className="cursor-pointer opacity-50 hover:opacity-100 text-itemCardIconColor hover:text-itemCardIconHoverColor transition-all duration-300"
                        >
                            <FiCopy size={20} />
                        </span>
                    }
                    {
                        (!showLinkCopy && !showAppsDataForSmallerScreen) && <span
                            role="button"
                            onClick={openThisLinkInNewTab}
                            className="cursor-pointer opacity-50 hover:opacity-100 text-itemCardIconColor hover:text-itemCardIconHoverColor transition-all duration-300"
                        >
                            <ImNewTab size={20} />
                        </span>
                    }
                </div>
                {
                    (showLinkCopy || showAppsDataForSmallerScreen) && <div style={{ width: `${((timeLeft) / totalTime) * 100}%`, transition: 'width 1s' }} className="absolute rounded bottom-0 left-0 bg-itemCardProgressColor h-2" />
                }
                {
                    (!showLinkCopy && !showAppsDataForSmallerScreen && props.item.integration && htmlData && width > 286) && (
                        <Link
                            to={decideTheLink()}>
                            {/* skipcq: JS-0440 */}
                            <motion.div
                                className='cursor-pointer absolute bottom-0 left-0 text-xs w-full hidden md:flex items-center justify-center'
                                style={{ maxHeight: '70px' }}
                                dangerouslySetInnerHTML={{ __html: htmlData || '' }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </Link>
                    )
                }
            </motion.div>
        </div>
    );
};

SingleListingInFront.propTypes = {
    item: PropTypes.object.isRequired,
};

const MemoizedComponent = React.memo(SingleListingInFront);
export default MemoizedComponent;

