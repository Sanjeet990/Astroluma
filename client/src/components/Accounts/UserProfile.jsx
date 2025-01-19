import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { FaUser, FaCamera, FaKey, FaTimes, FaCog, FaChevronRight, FaStar, FaCoffee } from 'react-icons/fa';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { changePasswordModalState, colorThemeState, imageModalState, loadingState, loginState, reloadDashboardDataState, removeBrandingModalState, selectedImageState, userDataState } from "../../atoms";
import SystemThemes from "../../utils/SystemThemes";
import ImageView from "../Misc/ImageView";
import ApiService from "../../utils/ApiService";
import { useNavigate } from "react-router-dom";
import makeToast from "../../utils/ToastUtils";
import useDynamicFilter from "../../hooks/useDynamicFilter";
import useCurrentRoute from "../../hooks/useCurrentRoute";
import UpdatePasswordModal from "../Modals/UpdatePasswordModal";
import BrandingRemovalModal from "../Modals/BrandingRemovalModal";
import { CONSTANTS } from "../../utils/Constants";

const UserProfile = () => {

    const navigate = useNavigate();
    const userData = useRecoilValue(userDataState);
    const loginData = useRecoilValue(loginState);

    const setChangeAvatar = useSetRecoilState(imageModalState);

    const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);
    const setLoading = useSetRecoilState(loadingState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);
    const setChangePassword = useSetRecoilState(changePasswordModalState);
    const setRemoveBranding = useSetRecoilState(removeBrandingModalState);

    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");
    const [isInitialMount, setIsInitialMount] = useState(true);

    useDynamicFilter(false);
    useCurrentRoute("/manage/profile");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    useEffect(() => {
        setSelectedImage(null);
        setIsInitialMount(false);
    }, [setSelectedImage, setIsInitialMount]);

    useEffect(() => {
        if (selectedImage !== null && !isInitialMount) {
            setLoading(true);

            ApiService.post("/api/v1/accounts/avatar", { avatar: selectedImage?.image }, loginData?.token, navigate)
                .then(() => {
                    setReloadData(true);
                    makeToast("success", "Avatar updated successfully.");
                })
                .catch((error) => {
                    if (!error.handled) makeToast("error", "Error updating avatar...");
                }).finally(() => {
                    setLoading(false);
                    setSelectedImage(null);
                });
        }
    }, [loginData?.token, setLoading, navigate, selectedImage, isInitialMount, setSelectedImage]);

    const decideTheIcon = useCallback(() => {
        const iconObject = userData?.userAvatar;
        if (themeType === "dark" && iconObject?.iconUrlLight) {
            return iconObject?.iconUrlLight;
        } else {
            return iconObject?.iconUrl;
        }
    }, [userData, themeType]);

    const doReBranding = () => {
        setLoading(true);
        ApiService.get("/api/v1/accounts/rebrand", loginData?.token, navigate)
            .then(() => {
                setReloadData(true);
                makeToast("success", "Astroluma branding applied successfully.");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Error applying Astroluma branding.");
            }).finally(() => {
                setLoading(false);
            });
    }

    const ProfileItems = ({ title, subtitle, icon, onClick }) => {
        return (
            <div
                className="rounded-lg shadow hover:shadow-md transition-shadow border border-cardBorder text-cardText"
                onClick={onClick}
            >
                <button className="w-full p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {icon}
                            <div className="text-left">
                                <h3 className="font-medium">{title}</h3>
                                <p className="text-xxs">{subtitle}</p>
                            </div>
                        </div>
                        <FaChevronRight className="h-5 w-5" />
                    </div>
                </button>
            </div>
        );
    }

    const changeAvatar = () => {
        setChangeAvatar({ isOpen: true, title: "Select Avatar", data: userData?._id?.toString() });
    }

    const changePassword = () => {
        setChangePassword({ isOpen: true, data: { userId: userData?._id } });
    }

    const editProfile = () => {
        navigate(`/manage/accounts/${userData?._id}`);
    }

    const removeBranding = () => {
        //setChangePassword({ isOpen: true, data: { userId: userData?._id } });
        setRemoveBranding({ isOpen: true });
    }

    const doDonate = () => {
        window.open(CONSTANTS.BuyMeACoffee, '_blank');
    };

    return (
        <>
            <Helmet>
                <title>My Profile</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle="My Profile" breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <UpdatePasswordModal />
            <BrandingRemovalModal />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <div className="py-8">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="pt-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-full bg-cardBorder relative overflow-hidden">
                                            <ImageView src={decideTheIcon()} alt="User avatar" className="h-24 w-24 rounded-full" />
                                            <div
                                                id="avatar-fallback"
                                                className="absolute inset-0 hidden items-center justify-center bg-gray-200"
                                            >
                                                <FaUser className="h-12 w-12 text-gray-400" />
                                            </div>
                                        </div>
                                        <button
                                            onClick={changeAvatar}
                                            className="absolute bottom-0 right-0 p-2 bg-cardBorder rounded-full shadow-lg transition-colors"
                                        >
                                            <FaCamera className="h-4 w-4 text-cardText" />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold">{userData?.fullName}</h2>
                                        <p className="text-gray-500">@{userData?.username}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <ProfileItems
                                    title="Edit Profile"
                                    subtitle="Update your profile information"
                                    onClick={editProfile}
                                    icon={<FaCog className="h-5 w-5" />}
                                />

                                <ProfileItems
                                    title="Change Password"
                                    subtitle="Update your security credentials"
                                    onClick={changePassword}
                                    icon={<FaKey className="h-5 w-5" />}
                                />

                                {
                                    !userData.hideBranding ? <ProfileItems
                                        title="Remove Astroluma Branding"
                                        subtitle="Remove powered by Astroluma text"
                                        onClick={removeBranding}
                                        icon={<FaTimes className="h-5 w-5" />}
                                    />
                                        :
                                        <ProfileItems
                                            title="Show Astroluma Branding"
                                            subtitle="Show powered by Astroluma text"
                                            onClick={doReBranding}
                                            icon={<FaStar className="h-5 w-5" />}
                                        />
                                }

                                <ProfileItems
                                    title="Support Our Project"
                                    subtitle="Support our project development"
                                    onClick={doDonate}
                                    icon={<FaCoffee className="h-5 w-5" />}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default React.memo(UserProfile);