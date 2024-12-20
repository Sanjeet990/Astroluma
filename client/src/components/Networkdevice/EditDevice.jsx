import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState, waitForAllSettled } from 'recoil';
import { loadingState, loginState, reloadFolderListingState, selectedImageState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceBack from '../NiceViews/NiceBack';
import NiceForm from '../NiceViews/NiceForm';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceUploader from '../NiceViews/NiceUploader';
import makeToast from '../../utils/ToastUtils';

const EditDevice = () => {
    const params = useParams();

    const deviceId = params?.deviceId;

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    const setFolderReloadStatus = useSetRecoilState(reloadFolderListingState);

    const [deviceMac, setDeviceMac] = useState("");
    const [deviceIp, setDeviceIp] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [broadcastAddress, setBroadcastAddress] = useState("");
    const [supportsWol, setSupportsWol] = useState(false);
    const [virtualDevice, setVirtualDevice] = useState(false);
    const [broadcastPort, setBroadcastPort] = useState(9);
    const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);

    useDynamicFilter(false);
    useCurrentRoute("/manage/networkdevices");

    //fetch details of the folder by listingId
    useEffect(() => {
        setLoading(true);
        ApiService.get(`/api/v1/networkdevices/device/${deviceId}`, loginData?.token)
            .then(data => {
                if (data?.message) {
                    setDeviceMac(data?.message?.deviceMac);
                    setDeviceName(data?.message?.deviceName);
                    setBroadcastAddress(data?.message?.broadcastAddress);
                    setBroadcastPort(data?.message?.broadcastPort);
                    setDeviceIp(data?.message?.deviceIp);
                    setSupportsWol(data?.message?.supportsWol);
                    setVirtualDevice(data?.message?.virtualDevice);

                    if (data?.message?.deviceIcon) {
                        setSelectedImage({ iconPath: data?.message?.deviceIcon });
                    }

                } else {
                    setDeviceMac("");
                    setFolderReloadStatus(true);
                    setSelectedImage(null);
                }
            })
            .catch(() => {
                makeToast("error", "Can not fetch device details. ");
            }).finally(() => {
                setLoading(false);
            });
    }, [deviceId, loginData?.token, setFolderReloadStatus, setSelectedImage, setLoading]);

    const handleFormSubmit = () => {

        const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

        if (!deviceName || !selectedImage?.iconPath) {
            makeToast("warning", "Please fill all the fields");
            return;
        }

        //Call the API to store the data
        const iconPath = selectedImage ? selectedImage.iconPath : "folder";

        if (deviceIp) {
            if (!ipv4Regex.test(deviceIp)) {
                makeToast("warning", "Invalid device IP address format. Please enter a valid IPv4.");
                return;
            }
        }

        if (supportsWol) {

            if (!deviceMac || !broadcastAddress || !broadcastPort) {
                makeToast("warning", "Please fill all the fields");
                return;
            }

            // Validate deviceMac against the regex
            if (!macAddressRegex.test(deviceMac)) {
                makeToast("warning", "Invalid MAC address format. Please enter a valid MAC address.");
                return;
            }

            if (!ipv4Regex.test(broadcastAddress)) {
                makeToast("warning", "Invalid broadcast IP address format. Please enter a valid IPv4.");
                return;
            }

            const port = parseInt(broadcastPort, 10); // Convert broadcastPort to a number
            if (isNaN(port) || port < 1 || port > 65535) {
                makeToast("warning", "Invalid port number. Please enter a value between 1 and 65535.");
                return;
            }

        }

        setLoading(true);
        ApiService.post('/api/v1/networkdevices/save/device', { deviceId, deviceMac, deviceName, broadcastAddress, broadcastPort, deviceIcon: iconPath, deviceIp, supportsWol, virtualDevice }, loginData?.token)
            .then(() => {
                setDeviceMac("");
                setDeviceName("");
                setBroadcastAddress("");
                setBroadcastPort(9);
                setDeviceIp("");
                setSupportsWol(waitForAllSettled);
                setVirtualDevice(false);
                setFolderReloadStatus(true);
                setSelectedImage(null);
                makeToast("success", "Device saved.");
                navigate(-1);
            })
            .catch(() => {
                makeToast("error", "Can not save device. ");
            }).finally(() => {
                setLoading(false);
            });

    };


    return (
        <>
            <Helmet>
                <title>{!deviceId ? "Add network device" : "Edit network Device"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!deviceId ? "Add network device" : "Edit network Device"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Network Devices", "linkUrl": "/manage/networkdevices" }]} />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NiceInput
                            label="Device Name"
                            value={deviceName}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="Enter device name"
                        />
                        <NiceUploader
                            label="Device Icon"
                            selectedImage={selectedImage}
                            placeholder="Select or upload icon"
                        />
                        <NiceInput
                            label="Device IP"
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            value={deviceIp}
                            onChange={(e) => setDeviceIp(e.target.value)}
                            placeholder="Enter device IP"
                        />
                        <NiceInput
                            label="Device MAC"
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            value={deviceMac}
                            onChange={(e) => setDeviceMac(e.target.value)}
                            placeholder="Enter device MAC"
                        />
                        <NiceCheckbox
                            label='Supports Wake on LAN'
                            checked={supportsWol}
                            onChange={(e) => setSupportsWol(e.target.checked)}
                        />
                        {
                            supportsWol &&
                            <>
                                <NiceInput
                                    label="Broadcast Address"
                                    className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                    value={broadcastAddress}
                                    onChange={(e) => setBroadcastAddress(e.target.value)}
                                    placeholder="Enter broadcast address"
                                />

                                <NiceInput
                                    label="Broadcast Port"
                                    className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                    value={broadcastPort}
                                    onChange={(e) => setBroadcastPort(e.target.value)}
                                    placeholder="Enter broadcast address"
                                />
                            </>
                        }
                        <NiceCheckbox
                            label='Is a virtual device'
                            checked={virtualDevice}
                            onChange={(e) => setVirtualDevice(e.target.checked)}
                        />

                        <div className="flex justify-end">
                            <NiceBack />

                            <NiceButton
                                label='Save'
                                onClick={handleFormSubmit}
                                className="bg-buttonSuccess text-buttonText"
                            />

                        </div>
                    </NiceForm>
                </div>
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(EditDevice);
export default MemoizedComponent;
