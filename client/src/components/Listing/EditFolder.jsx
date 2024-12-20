import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, reloadDashboardDataState, reloadFolderListingState, selectedImageState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceBack from '../NiceViews/NiceBack';
import NiceButton from '../NiceViews/NiceButton';
import NiceForm from '../NiceViews/NiceForm';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceUploader from '../NiceViews/NiceUploader';
import makeToast from '../../utils/ToastUtils';

const EditFolder = () => {
    //get listingId from param
    const params = useParams();

    const listingId = params?.listingid;
    const parentId = params?.parentid;

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);

    const setFolderReloadStatus = useSetRecoilState(reloadFolderListingState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);

    const [folderName, setFolderName] = useState("");
    const [showInSidebar, setShowInSidebar] = useState(false);
    const [showOnFeatured, setShowOnFeatured] = useState(!parentId ? true : false);

    useDynamicFilter(false);
    useCurrentRoute("/manage/listing")

    //fetch details of the folder by listingId
    useEffect(() => {
        setLoading(true);
        ApiService.get(`/api/v1/listing/folder/${listingId}`, loginData?.token)
            .then(data => {
                if (data?.message?.listing) {
                    setFolderName(data?.message?.listing?.listingName);
                    setShowInSidebar(data?.message?.listing?.inSidebar);
                    setShowOnFeatured(data?.message?.listing?.onFeatured);

                    if (data?.message?.listing?.listingIcon) {
                        setSelectedImage({ iconPath: data?.message?.listing?.listingIcon });
                    }

                    if (data?.message?.listing?.listingType !== "category") {
                        navigate("/manage/listing");
                    }
                } else {
                    setSelectedImage(null);
                    setFolderName("");
                    setShowInSidebar(false);
                    setShowOnFeatured(false);
                    setFolderReloadStatus(true);
                }
            })
            .catch(() => {
                makeToast("error", "Failed to fetch folder details.");
            }).finally(() => {
                setLoading(false);
            });
    }, [listingId, loginData?.token, navigate, setLoading, setFolderReloadStatus, setSelectedImage]);

    const handleFormSubmit = () => {


        if (!folderName || !selectedImage?.iconPath) {
            makeToast("warning", "Please fill all the fields");
            return;
        }

        //Call the API to store the data
        const iconPath = selectedImage ? selectedImage.iconPath : "folder";

        setLoading(true);
        ApiService.post('/api/v1/listing/save/folder', { listingId, parentId, folderName, folderIcon: iconPath, showInSidebar, showOnFeatured }, loginData?.token)
            .then(() => {
                setSelectedImage(null);
                setFolderName("");
                setShowInSidebar(false);
                setShowOnFeatured(false);
                setFolderReloadStatus(true);
                setReloadData(true);
                makeToast("success", "Folder saved.");
                navigate(-1);
            })
            .catch(() => {
                makeToast("error", "Failed to save folder.");
            }).finally(() => {
                setLoading(false);
            });

    };

    return (
        <>
            <Helmet>
                <title>{!listingId ? "Add a new folder" : "Edit a folder"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!listingId ? "Add a new folder" : "Edit a folder"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Listing", "linkUrl": "/manage/listing" }]} />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NiceInput
                            label="Folder Name"
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="Enter folder name"
                        />
                        <NiceUploader
                            label="Folder Icon"
                            selectedImage={selectedImage}
                            placeholder="Select or upload icon"
                        />
                        {
                            !parentId && <NiceCheckbox
                                label="Show on featured screen"
                                checked={showOnFeatured}
                                onChange={(e) => setShowOnFeatured(e.target.checked)}
                            />
                        }
                        <NiceCheckbox
                            label="Show in sidebar"
                            checked={showInSidebar}
                            onChange={(e) => setShowInSidebar(e.target.checked)}
                        />
                        <div className="flex justify-end">
                            <NiceBack />

                            <NiceButton
                                label="Save"
                                className="bg-buttonSuccess text-buttonText"
                                onClick={handleFormSubmit}
                                type="submit"
                            />

                        </div>
                    </NiceForm>
                </div>
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(EditFolder);
export default MemoizedComponent;
