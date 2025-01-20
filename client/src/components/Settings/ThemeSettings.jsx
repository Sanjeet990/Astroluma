import React, { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { colorThemeState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import SystemThemes from '../../utils/SystemThemes';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const ThemeSettings = () => {

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    const [colorTheme, setColorTheme] = useRecoilState(colorThemeState);

    const [currentTheme, setCurrentTheme] = useState(colorTheme);

    const handleSelection = (e) => {
        e.preventDefault();
        const selectedValue = e.target.value;
        setCurrentTheme(selectedValue);
    }

    const saveThemeSelection = () => {

        if (!currentTheme) {
            return makeToast("warning", "Theme selection is required");
        }

        if (currentTheme === colorTheme) {
            return;
        }

        setColorTheme(currentTheme);

        //send data to save
        setLoading(true);
        ApiService.post("/api/v1/settings/theme", { colorTheme: currentTheme }, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Theme saved successfully.");
                //setReloadData(true);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Theme could not be saved.");
            }).finally(() => {
                setLoading(false);
            });

    }

    return (
        <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
            <div className="mt-8">
                <h2 className="text-2xl ">Theme Settings</h2>
                <div className="mt-4">
                    <label className="block text-sm  mb-2" htmlFor="sitename">
                        Select Theme
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-inputBg border-inputBorder text-inputText leading-tight focus:outline-none focus:shadow-outline"
                        id="sitename"
                        type="text"
                        value={currentTheme}
                        onChange={handleSelection}
                        placeholder="Select theme"
                    >
                        {
                            SystemThemes.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </div>
            <div className="mt-4">
                <NiceButton
                    label="Save"
                    className="bg-buttonSuccess text-buttonText"
                    onClick={saveThemeSelection}
                />
            </div>
        </div>
    );
};

const MemoizedComponent = React.memo(ThemeSettings);
export default MemoizedComponent;