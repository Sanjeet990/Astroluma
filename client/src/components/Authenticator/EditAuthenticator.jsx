import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { imageModalState, loadingState, loginState, reloadDashboardDataState, selectedImageState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { isValidSecretKey, validateOTPAuthURL } from '../../utils/Helper';
import jsQR from "jsqr";
import ImageView from '../Misc/ImageView';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NiceBack from '../NiceViews/NiceBack';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import makeToast from '../../utils/ToastUtils';

const EditAuthenticator = () => {

    const params = useParams();
    const navigate = useNavigate();

    const authId = params?.authId;

    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(loadingState);

    const setModalState = useSetRecoilState(imageModalState);

    const setReloadData = useSetRecoilState(reloadDashboardDataState);

    const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);

    const [serviceIcon, setServiceIcon] = useState("authenticator");
    const [serviceName, setServiceName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const fileInput = useRef(null);

    useDynamicFilter(false);
    useCurrentRoute("/manage/totp");

    useEffect(() => {
        if (authId) {
            setLoading(true);
            ApiService.get(`/api/v1/totp/${authId}`, loginData?.token)
                .then(data => {
                    setSelectedImage({ iconPath: data?.message?.serviceIcon });
                    setServiceName(data?.message?.serviceName);
                    setAccountName(data?.message?.accountName);
                    setSecretKey(data?.message?.secretKey);
                    setReloadData(true);
                })
                .catch(() => {
                    makeToast("error", "Failed to fetch authenticator details.");
                }).finally(() => {
                    setLoading(false);
                });
        }
    }, [authId, loginData?.token, navigate, setLoading, setSelectedImage, setReloadData]);

    const submitForm = () => {

        if (!secretKey) {
            makeToast("warning", "Secret Key or URL is required.");
            return;
        }

        //Check if URL was entered
        let secret = secretKey;
        if (secretKey.startsWith("otpauth://")) {
            if (!validateOTPAuthURL(secretKey)) {
                makeToast("warning", "The auth URL is invalid.");
                return;
            } else {
                const { secret: secretFromUrl, serviceNameNew, accountNameNew } = parseOtpUrl(secretKey);
                secret = secretFromUrl;
                setServiceName(serviceNameNew);
                setAccountName(accountNameNew);
            }
        }

        if (!isValidSecretKey(secret)) {
            makeToast("warning", "The secret key is invalid.");
            return;
        }

        if (!serviceIcon || !selectedImage) {
            makeToast("warning", "Service Icon is required.");
            return;
        }
        if (!serviceName) {
            makeToast("warning", "Service Name is required.");
            return;
        }
        if (!accountName) {
            makeToast("warning", "Account Name is required.");
            return;
        }

        const iconPath = selectedImage ? selectedImage.iconPath : serviceIcon;

        setLoading(true);
        ApiService.post('/api/v1/totp/save', { authId, serviceIcon: iconPath, serviceName, secret, accountName }, loginData?.token)
            .then(() => {
                makeToast("success", "Service saved.");
                setServiceIcon("authenticator");
                setServiceName('');
                setAccountName('');
                setSecretKey('');
                setReloadData(true);
                setSelectedImage(null);
                navigate("/manage/totp")
            })
            .catch(() => {
                makeToast("error", "Failed to save service.");
            }).finally(() => {
                setLoading(false);
            });
    }

    const parseOtpUrl = (otpUrl) => {
        if (!otpUrl) {
            return null;
        }

        if (!validateOTPAuthURL(otpUrl)) {
            return null;
        }

        const secretMatch = otpUrl.match(/secret=([^&]+)/);
        const serviceNameMatch = otpUrl.match(/issuer=([^&]+)/);
        const accountNameMatch = otpUrl.match(/:\/\/totp\/[^:]*:([^?&]+)/);

        const secret = secretMatch ? secretMatch[1] : '';
        const serviceNameNew = serviceNameMatch ? serviceNameMatch[1] : '';
        const accountNameNew = accountNameMatch ? accountNameMatch[1] : '';

        return { secret, serviceNameNew, accountNameNew };
    }

    const selectQrCode = () => {
        fileInput.current.click();
    }

    const handleFileChange = async (event) => {
        setLoading(true);
        const file = event.target.files[0];
        if (file) {

            // Create a new FileReader object
            const reader = new FileReader();

            reader.onloadend = async function () {
                // Create a new Image object
                const img = new Image();
                img.onload = function () {
                    // Create a canvas and draw the image onto it
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0, img.width, img.height);

                    // Get the image data from the canvas
                    const imageData = context.getImageData(0, 0, img.width, img.height);

                    // Decode the QR code from the image data
                    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                    if (qrCode) {
                        if (!validateOTPAuthURL(qrCode.data)) {
                            makeToast("error", "Selected file is not a valid TOTP QR code.");
                            return;
                        } else {
                            const { secret: secretFromUrl, serviceNameNew, accountNameNew } = parseOtpUrl(qrCode.data);
                            setSecretKey(secretFromUrl);
                            setServiceName(serviceNameNew);
                            setAccountName(accountNameNew);
                        }
                    } else {
                        makeToast("error", "Selected file is not a valid TOTP QR code.");
                        return;
                    }
                    //clear the file fileInput selection
                    fileInput.current.value = '';
                };

                // Set the image source to the result of the FileReader
                img.src = reader.result;
                setLoading(false);
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    };


    return (
        <>
            <Helmet>
                <title>{!authId ? "Add authenticator" : "Edit authenticator"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!authId ? "Add authenticator" : "Edit authenticator"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Authenticator", "linkUrl": "/manage/networkdevices" }]} />


            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <div role='button' className="flex flex-col justify-center items-center mb-4 cursor-pointer" onClick={selectQrCode}>
                        <input type="file" ref={fileInput} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                        <div className="w-12 h-12 bg-taskCardBg rounded-full flex justify-center items-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <p className="text-center">Upload QR</p>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="serviceIcon" className="block mb-2">Service Icon</label>
                        {selectedImage && (
                            <div role="button" onClick={() => setModalState({ isOpen: true, data: null })} className="flex justify-center items-center mb-4">
                                <ImageView src={selectedImage.iconPath} alt="Selected Authenticator" defaultSrc="/default.png" errorSrc="/default.png" width="80px" height="80px" className="w-12 h-12 rounded-full" />
                            </div>
                        )}
                        <div role="button" onClick={() => setModalState({ isOpen: true, data: null })} className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText">
                            Select or upload icon
                        </div>
                    </div>
                    <NiceInput
                        label="Service Name"
                        value={serviceName}
                        className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Enter service name"
                    />
                    <NiceInput
                        label="Account Name"
                        value={accountName}
                        className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Enter account name"
                    />
                    <NiceInput
                        label="Secret Key or URL"
                        disabled={authId}
                        className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter secret key or URL"
                    />

                    <div className="flex justify-end">
                        <NiceBack />

                        <NiceButton
                            label="Save"
                            onClick={submitForm}
                            className='bg-buttonSuccess text-buttonText'
                        />
                    </div>
                </div>
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(EditAuthenticator);
export default MemoizedComponent;
