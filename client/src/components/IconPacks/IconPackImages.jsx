import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { loginState, deleteImageModalState, deletedImageState, loadingState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { motion } from 'framer-motion';
import ImageView from '../Misc/ImageView';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import { Helmet } from "react-helmet";
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import { FaTrash } from 'react-icons/fa';
import DeleteImageModal from '../Modals/DeleteImageModal';
import NoListing from '../Misc/NoListing';
import { FaImage } from "react-icons/fa6";

const IconPackImages = () => {
    const navigate = useNavigate();
    const params = useParams();
    const iconPackId = params?.iconPackId;

    const [imageList, setImageList] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMoreItems, setHasMoreItems] = useState(true);
    const [iconPackName, setIconPackName] = useState("My Icons");

    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(loadingState);
    const setImageDelete = useSetRecoilState(deleteImageModalState);
    const [deletedImage, setDeletedImage] = useRecoilState(deletedImageState);

    useDynamicFilter(false);
    useCurrentRoute("/manage/iconpack/images");

    const fetchImages = useCallback(async () => {
        if (!loginData?.token) return;

        setLoading(true);

        ApiService.get(`/api/v1/images?page=${page}`, loginData?.token, navigate)
            .then((response) => {
                const data = response?.data;
                if (data.length === 0) {
                    setHasMoreItems(false);
                    return;
                }

                setImageList(prev => {
                    const newImages = data.filter(newImg =>
                        !prev.some(existingImg => existingImg.id === newImg.id)
                    );
                    return [...prev, ...newImages];
                });
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Cannot load images.");
            }).finally(() => {
                setLoading(false);
            });
    }, [page, loginData?.token, navigate]);

    // Fetch icon pack info
    useEffect(() => {
        if (iconPackId && loginData?.token) {
            setLoading(true);
            ApiService.get(`/api/v1/iconpack/info/${iconPackId}`, loginData?.token, navigate)
                .then(data => {
                    setIconPackName(data?.message?.iconName || "My Icons");
                })
                .catch((error) => {
                    if (!error.handled) makeToast("error", "Cannot load icon pack information.");
                }).finally(() => {
                    setLoading(false);
                });
        }
    }, [iconPackId, loginData?.token, navigate, setLoading]);

    // Fetch initial data and handle image deletion
    useEffect(() => {
        fetchImages();

        // Reset when an image is deleted and refresh image list
        if (deletedImage) {
            setImageList(prevImages => prevImages.filter(img => img.id !== deletedImage));
            setDeletedImage(null);
        }
    }, [fetchImages, deletedImage, setDeletedImage]);

    const handleLoadMore = () => {
        if (hasMoreItems) {
            setPage(prev => prev + 1);
        }
    };

    const handleDeleteImage = (imageId) => {
        setImageDelete({ isOpen: true, data: { imageId } });
    };

    return (
        <>
            <DeleteImageModal />
            <Helmet>
                <title>{iconPackName} - Images</title>
            </Helmet>

            <Breadcrumb
                type="custom"
                pageTitle={`${iconPackName} Images`}
                breadcrumbList={[
                    { "id": "1", "linkName": "Settings", "linkUrl": "/manage" },
                    { "id": "2", "linkName": "Icon Packs", "linkUrl": "/manage/iconpack" }
                ]}
            />

            <div className="mt-4">
                {
                    imageList.length > 0 ? <>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {imageList.map((image) => (
                                <motion.div
                                    key={image.id}
                                    whileHover={{ scale: 0.95 }}
                                    className="relative w-full aspect-square p-8 border border-imageSelectionBorder hover:border-imageSelectionHoverBorder bg-imageSelectionBg hover:bg-imageSelectionHoverBg hover:cursor-pointer rounded-lg flex justify-center items-center transition-all duration-300 group"
                                >
                                    <ImageView
                                        src={image.iconPath}
                                        alt={`Image ${image.id}`}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                        defaultSrc="/default.png"
                                        errorSrc="/default.png"
                                    />
                                    {/* Enhanced delete button with better visibility */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteImage(image.id);
                                        }}
                                        className="absolute top-1 right-1 bg-buttonDanger hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-110 z-10"
                                        title="Delete image"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {(imageList.length > 0 && hasMoreItems) && (
                            <div className="flex justify-center mt-8">
                                <NiceButton
                                    label='Load More'
                                    onClick={handleLoadMore}
                                    disabled={!hasMoreItems}
                                    className='bg-buttonGeneric text-buttonText'
                                />
                            </div>
                        )}
                    </>
                        :
                        <NoListing
                            mainText="Oops! Nothing to List here"
                            subText="Please upload some images first!"
                            buttonText="Go to home"
                            buttonLink="/"
                            displayIcon={<FaImage  />}
                        />
                }
            </div>
        </>
    );
};

export default React.memo(IconPackImages);