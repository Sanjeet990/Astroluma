import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, reloadDashboardDataState, userDataState, weatherLocationSearchModalState, weatherLocationSelectedState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { motion } from 'framer-motion';
import LocationSelectorModal from '../Modals/LocationSelectorModal';
import { MdClear } from "react-icons/md";
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import { Helmet } from 'react-helmet';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import NiceBack from '../NiceViews/NiceBack';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import { useNavigate } from 'react-router-dom';

const WeatherSettings = () => {

    const navigate = useNavigate();

    const setActiveRoute = useCurrentRoute();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);
    const userData = useRecoilValue(userDataState);

    const [selectedUnit, setSelectedUnit] = useState("metric");

    const setLocationSelectorModal = useSetRecoilState(weatherLocationSearchModalState);
    const [selectedLocation, setSelectedLocation] = useRecoilState(weatherLocationSelectedState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute("/manage/weather");
    }, [setActiveRoute]);

    const handleUnitSelection = (e) => {
        e.preventDefault();
        const selectedValue = e.target.value;
        setSelectedUnit(selectedValue);
    }

    useEffect(() => {
        if (userData?.latitude && userData?.longitude) {
            const location = {
                location: userData?.location,
                latitude: userData?.latitude,
                longitude: userData?.longitude
            }
            setSelectedLocation(location);
            setSelectedUnit(userData?.unit);
        }
    }, [userData, setSelectedLocation]);


    const saveLocationSettings = () => {

        if (!selectedLocation) {
            return makeToast("warning", "Location selection is required.");
        }

        if (!selectedUnit) {
            return makeToast("warning", "Unit selection is required.");
        }

        setLoading(true);

        ApiService.post("/api/v1/settings/weather", { location: selectedLocation, unit: selectedUnit }, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Weather settings saved successfully.");
                setReloadData(true);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Weather settings could not be saved.");
            }).finally(() => {
                setLoading(false);
            });
    }

    const selectLocation = () => {
        setLocationSelectorModal(true);
    }

    const clearLocationSelection = () => {
        setSelectedLocation(null);
    }

    return (
        <>
            <LocationSelectorModal title={"Select Location"} />
            <Helmet>
                <title>Weather Settings</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"Weather Settings"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="max-w-4xl mx-auto w-full">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <div className="mt-4">
                        {
                            selectedLocation ?
                                <div className="shadow appearance-none border rounded w-full py-2 px-3 bg-inputBg border-inputBorder p-4 flex items-center justify-between mb-4 ">
                                    <p>{selectedLocation.location}</p>
                                    <motion.button whileHover={{ scale: 1.2 }} style={{ display: 'inline-flex' }} className="text-inputText"
                                        onClick={clearLocationSelection}>
                                        <MdClear size={24} />
                                    </motion.button>
                                </div>
                                :
                                <NiceButton
                                    label="Select a location"
                                    className="bg-buttonGeneric text-buttonText w-full"
                                    onClick={selectLocation}
                                />

                        }

                        <label className="block text-sm  mb-2" htmlFor="selectedUnit">
                            Unit
                        </label>
                        <select
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-inputBg border-inputBorder text-inputText leading-tight focus:outline-none focus:shadow-outline"
                            id="selectedUnit"
                            type="text"
                            value={selectedUnit}
                            onChange={handleUnitSelection}
                            placeholder="Select Unit"
                        >
                            <option value="metric">Metric</option>
                            <option value="imperial">Imperial</option>
                        </select>
                    </div>

                    <div className="flex justify-end mt-4">
                        <NiceBack />

                        <NiceButton
                            label="Save"
                            className="bg-buttonSuccess text-buttonText"
                            onClick={saveLocationSettings}
                        />

                    </div>
                </div>
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(WeatherSettings);
export default MemoizedComponent;