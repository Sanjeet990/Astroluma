import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploader } from "react-drag-drop-files";
import { useRecoilValue } from 'recoil';
import { loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import ImageView from '../Misc/ImageView';
import NiceButton from '../NiceViews/NiceButton';
import NiceLoader from '../NiceViews/NiceLoader';
import makeToast from '../../utils/ToastUtils';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const MyIconsSection = ({ onSelectImage }) => {
    const navigate = useNavigate();

    const [isUploading, setIsUploading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [hasMoreItems, setHasMoreItems] = useState(true);
    const [imageList, setImageList] = useState([]);
    const [page, setPage] = useState(1);

    const loginData = useRecoilValue(loginState);
    const fileTypes = ["JPG", "PNG", "GIF"];

    useEffect(() => {
        setPage(1);
        setImageList([]);
        setHasMoreItems(true);
    }, [loginData?.token]);

    const uploadSelectedFile = async (iconFile) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('icon', iconFile);

        ApiService.postWithFormData('/api/v1/images/upload', formData, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "File uploaded.");
                setPage(1);
                setImageList([]);
                setHasMoreItems(true);
                fetchImages();
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Cannot upload file.");
            }).finally(() => {
                setIsUploading(false);
            });

    };

    const handleIconUpload = (file) => {
        if (file?.type?.startsWith('image/')) {
            uploadSelectedFile(file);
        } else {
            makeToast("error", "Invalid file selected.");
        }
    };

    const fetchImages = useCallback(async () => {
        if (!loginData?.token) return;

        setIsDataLoading(true);

        ApiService.get(`/api/v1/images?page=${page}`, loginData?.token, navigate)
            .then((data) => {
                if (data.length === 0) {
                    setHasMoreItems(false);
                    return;
                }
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Cannot load images.");
            }).finally(() => {
                setIsDataLoading(false);
            });

    }, [page, loginData?.token, navigate]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleLoadMore = () => {
        if (!isDataLoading && hasMoreItems) {
            setPage(prev => prev + 1);
        }
    };

    const renderUploader = () => (
        !isUploading ? (
            <>
                <FileUploader handleChange={handleIconUpload} name="file" types={fileTypes} />
                {imageList.length > 0 && (
                    <div className="text-center mt-4 mb-4">Or select from existing</div>
                )}
            </>
        ) : (
            <div className="flex flex-col justify-center items-center p-4 shadow rounded border border-gray-700">
                <NiceLoader className='text-loaderColor' />
                <p className="mt-4 text-center">Uploading...</p>
            </div>
        )
    );

    const handleSelectIcon = (image) => {
        if (image) {
            onSelectImage({
                iconUrl: image?.iconPath,
                iconUrlLight: null,
                iconProvider: "com.astroluma.self",
                iconId: image?.iconPath,
            });
        } else {
            makeToast("error", "No valid icon format available");
        }
    };

    const renderImageGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 overflow-auto max-h-64 place-items-center">
            {imageList.map((image) => (
                <motion.div
                    key={image._id}
                    whileHover={{ scale: 0.92 }}
                    onClick={() => handleSelectIcon(image)}
                    className="w-18 h-18 p-1 border border-imageSelectionBorder hover:border-imageSelectionHoverBorder bg-imageSelectionBg hover:bg-imageSelectionHoverBg rounded-lg flex justify-center items-center cursor-pointer transition-all duration-300"
                >
                    <ImageView
                        src={image.iconPath}
                        alt="placeholder"
                        className="w-20 h-20 object-cover rounded-lg"
                        defaultSrc="/default.png"
                    />
                </motion.div>
            ))}
        </div>
    );

    return (
        <div>
            {renderUploader()}
            {renderImageGrid()}

            {isDataLoading && (
                <div className="flex flex-col justify-center items-center p-1 shadow rounded border border-gray-700">
                    <NiceLoader className='text-loaderColor' />
                </div>
            )}

            {(!isDataLoading && imageList.length > 0) && (
                <div className="flex justify-center mt-4">
                    <NiceButton
                        label='Load More'
                        onClick={handleLoadMore}
                        disabled={!hasMoreItems || isDataLoading}
                        parentClassname='w-full'
                        className='w-full bg-buttonGeneric text-buttonText'
                    />
                </div>
            )}
        </div>
    );
};

MyIconsSection.propTypes = {
    onSelectImage: PropTypes.func
};

export default React.memo(MyIconsSection);