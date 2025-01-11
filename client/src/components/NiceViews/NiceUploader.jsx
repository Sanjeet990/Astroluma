import React, { useCallback, useEffect, useState } from "react";
import ImageView from "../Misc/ImageView";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { colorThemeState, imageModalState } from "../../atoms";
import PropTypes from "prop-types";
import SystemThemes from "../../utils/SystemThemes";

const NiceUploader = ({ label = "Link Icon", selectedImage = null, placeholder = "Select or upload icon" }) => {
    const setModalState = useSetRecoilState(imageModalState);
    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const decideTheIcon = useCallback(() => {
        if (themeType === "dark" && selectedImage?.iconUrlLight) {
            return selectedImage?.iconUrlLight;
        } else {
            return selectedImage?.iconUrl;
        }
    }, [selectedImage, themeType]);

    const handleClick = () => setModalState({ isOpen: true, data: null });

    return (
        <div className="mb-4">
            <label className="block mb-2" htmlFor="linkIcon">
                {label}
            </label>
            <div className="flex items-center gap-3">
                <div 
                    role="button" 
                    onClick={handleClick}
                    className="flex-shrink-0 w-10 h-10 rounded-lg border border-inputBorder bg-inputBg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-opacity-80 transition-colors"
                >
                    {selectedImage ? (
                        <ImageView 
                            src={decideTheIcon()} 
                            alt="Selected Icon" 
                            className="w-8 h-8 object-cover" 
                            defaultSrc="/default.png" 
                            errorSrc="/default.png" 
                            width="32px" 
                            height="32px" 
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-inputBorder opacity-30" />
                    )}
                </div>
                <div
                    role="button"
                    onClick={handleClick}
                    className="flex-grow cursor-pointer appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder hover:bg-opacity-80 transition-colors"
                >
                    {placeholder}
                </div>
            </div>
        </div>
    );
};

NiceUploader.propTypes = {
    label: PropTypes.string,
    selectedImage: PropTypes.object,
    placeholder: PropTypes.string
};

const MemoizedComponent = React.memo(NiceUploader);
export default MemoizedComponent;