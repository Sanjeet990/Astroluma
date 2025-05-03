import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { FaTrash, FaUpload } from 'react-icons/fa';
import DeleteImageModal from '../Modals/DeleteImageModal';
import NoListing from '../Misc/NoListing';
import { FaImage } from "react-icons/fa6";

const IconPackImages = () => {
    const navigate = useNavigate();
    const params = useParams();
    const iconPackId = params?.iconPackId;
    const fileInputRef = useRef(null);

    const [imageList, setImageList] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMoreItems, setHasMoreItems] = useState(true);
    const [iconPackName, setIconPackName] = useState("My Icons");
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentUploads, setCurrentUploads] = useState([]);

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
    }, [page, loginData?.token, navigate, setLoading]);

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

    // Check if file is a valid image
    const isValidImage = (file) => {
        return file && file.type && file.type.startsWith('image/');
    };

    const handleFilesUpload = async (files) => {
        if (!loginData?.token || !files || files.length === 0) return;

        // Filter valid image files
        const validImageFiles = Array.from(files).filter(isValidImage);
        
        if (validImageFiles.length === 0) {
            makeToast("warning", "Please select valid image files.");
            return;
        }
        
        if (validImageFiles.length !== files.length) {
            makeToast("warning", "Some files were skipped because they are not valid images.");
        }

        setIsUploading(true);
        setLoading(true);
        
        // Create file status array for tracking uploads
        const uploads = validImageFiles.map(file => ({
            name: file.name,
            status: 'pending',
            progress: 0
        }));
        
        setCurrentUploads(uploads);
        
        // Upload files sequentially
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < validImageFiles.length; i++) {
            const file = validImageFiles[i];
            const formData = new FormData();
            formData.append("icon", file);
            
            // Update current file status
            setCurrentUploads(prev => {
                const newUploads = [...prev];
                newUploads[i] = {...newUploads[i], status: 'uploading', progress: 0};
                return newUploads;
            });
            
            try {
                const response = await ApiService.postWithFormData(`/api/v1/images/upload`, formData, loginData?.token, navigate);
                
                // Mark this file as completed
                setCurrentUploads(prev => {
                    const newUploads = [...prev];
                    newUploads[i] = {...newUploads[i], status: 'completed', progress: 100};
                    return newUploads;
                });
                
                successCount++;
                
                // Update overall progress
                setUploadProgress(Math.round((i + 1) / validImageFiles.length * 100));
                
            } catch (error) {
                failCount++;
                
                // Mark this file as failed
                setCurrentUploads(prev => {
                    const newUploads = [...prev];
                    newUploads[i] = {...newUploads[i], status: 'failed', progress: 0};
                    return newUploads;
                });
                
                if (!error.handled) {
                    console.error(`Failed to upload image ${file.name}:`, error);
                }
            }
        }

        // Show upload summary
        if (successCount > 0 && failCount > 0) {
            makeToast("info", `Uploaded ${successCount} images successfully. ${failCount} uploads failed.`);
        } else if (successCount > 0) {
            makeToast("success", `Successfully uploaded ${successCount} images!`);
        } else if (failCount > 0) {
            makeToast("error", "Failed to upload any images.");
        }
        
        // Refresh image list
        setPage(1);
        setImageList([]);
        setHasMoreItems(true);
        fetchImages();
        
        setIsUploading(false);
        setLoading(false);
        setUploadProgress(0);
        
        // Clear uploads status after a delay
        setTimeout(() => {
            setCurrentUploads([]);
        }, 3000);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFilesUpload(files);
        }
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFilesUpload(files);
        }
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
                <div
                    className={`border-2 border-dashed rounded-lg p-6 mb-6 transition-all duration-300 w-full ${isDragging ? 'border-blue-500 bg-blue-100/10' : 'border-gray-300/50'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center">
                        <FaUpload className="text-4xl mb-3 text-gray-400" />
                        <p className="text-center text-gray-500 mb-2">Drag and drop multiple image files here</p>
                        <p className="text-center text-gray-400 text-sm mb-4">or</p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileInputChange}
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            className="bg-buttonGeneric text-buttonText px-6 py-2 rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all duration-300"
                        >
                            <FaUpload className="mr-2" /> Select Images
                        </button>
                        {isUploading && (
                            <div className="mt-6 w-full max-w-md">
                                <div className="text-center text-gray-500 mb-1">
                                    Uploading... {uploadProgress}%
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                
                                {/* File upload status list */}
                                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                                    {currentUploads.map((upload, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="truncate max-w-[200px]">{upload.name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                upload.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                upload.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {upload.status === 'completed' ? 'Success' : 
                                                 upload.status === 'failed' ? 'Failed' : 
                                                 'Uploading...'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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