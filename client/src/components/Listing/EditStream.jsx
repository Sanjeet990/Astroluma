import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceBack from '../NiceViews/NiceBack';
import NiceForm from '../NiceViews/NiceForm';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import makeToast from '../../utils/ToastUtils';

const EditStream = () => {
    const params = useParams();

    const listingId = params?.listingid;
    const parentId = params?.parentid;

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    const [linkName, setLinkName] = useState("");
    const [linkURL, setLinkURL] = useState("");

    const setActiveRoute = useCurrentRoute();

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute("/manage/streaming");
    }, [setActiveRoute]);

    //fetch details of the link by listingId
    useEffect(() => {
        setLoading(true);
        ApiService.get(`/api/v1/listing/stream/${listingId}`, loginData?.token, navigate)
            .then(data => {
                if (data?.message?.listing) {
                    setLinkName(data?.message?.listing?.listingName);
                    setLinkURL(data?.message?.listing?.listingUrl);

                    if (data?.message?.listing?.listingType !== "stream") {
                        navigate("/manage/listing");
                    }
                } else {
                    setLinkName("");
                    setLinkURL("");
                }
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch stream details.");
            }).finally(() => {
                setLoading(false);
            });
    }, [listingId, loginData?.token, navigate, setLoading]);

    const handleFormSubmit = () => {

        if (!linkName || !linkURL) {
            makeToast("warning", "Please fill all the fields");
            return;
        }

        setLoading(true);
        ApiService.post('/api/v1/listing/save/stream', { listingId, parentId, linkName, linkURL }, loginData?.token, navigate)
            .then(() => {
                setLinkName("");
                setLinkURL("");
                makeToast("success", "Stream saved.");
                navigate(-1);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to save stream.");
            }).finally(() => {
                setLoading(false);
            });

    };


    return (
        <>
            <Helmet>
                <title>{!listingId ? "Add new RTSP stream" : "Edit RTSP stream"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!listingId ? "Add new RTSP stream" : "Edit RTSP stream"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Stream Hub", "linkUrl": "/manage/streaming" }]} />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NiceInput
                            label="Stream Name"
                            value={linkName}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setLinkName(e.target.value)}
                            placeholder="Enter stream name"
                        />

                        <NiceInput
                            label="Stream URL"
                            value={linkURL}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setLinkURL(e.target.value)}
                            placeholder="Enter stream URL"
                        />

                        <div className="flex justify-end">
                            <NiceBack />

                            <NiceButton
                                label="Save"
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


const MemoizedComponent = React.memo(EditStream);
export default MemoizedComponent;
