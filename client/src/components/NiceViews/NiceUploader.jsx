import React from "react";
import ImageView from "../Misc/ImageView";
import { useSetRecoilState } from "recoil";
import { imageModalState } from "../../atoms";
import PropTypes from "prop-types";

const NiceUploader = ({ label = "Link Icon", selectedImage = null, placeholder = "Select or upload icon" }) => {

    const setModalState = useSetRecoilState(imageModalState);

    return (
        <div className="mb-4">
            <label className="block mb-2" htmlFor="linkIcon">
                {label}
            </label>
            {selectedImage && (
                <div role="button" onClick={() => setModalState({ isOpen: true, data: null })} className="cursor-pointer flex justify-center items-center mb-4">
                    <ImageView src={selectedImage.iconPath} alt="Selected Icon" className="w-12 h-12 rounded-full" defaultSrc="/default.png" errorSrc="/default.png" width="80px" height="80px" />
                </div>
            )}
            <div
                role="button"
                onClick={() => setModalState({ isOpen: true, data: null })}
                className="cursor-pointer appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder"
            >
                {placeholder}
            </div>
        </div>
    )
}

NiceUploader.propTypes = {
    label: PropTypes.string,
    selectedImage: PropTypes.object,
    placeholder: PropTypes.string
}

const MemoizedComponent = React.memo(NiceUploader);
export default MemoizedComponent;
