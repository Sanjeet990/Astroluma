import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { colorThemeState, loadingState, loginState, reloadDashboardDataState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';

import JoditEditor from 'jodit-react';

import NiceBack from '../NiceViews/NiceBack';
import NiceForm from '../NiceViews/NiceForm';
import NiceButton from '../NiceViews/NiceButton';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceInput from '../NiceViews/NiceInput';
import makeToast from '../../utils/ToastUtils';
import SystemThemes from '../../utils/SystemThemes';

import './Jodit.css';

const EditPage = () => {

    const params = useParams();

    const pageId = params?.pageId;

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);
    const loginData = useRecoilValue(loginState);

    const [pageTitle, setPageTitle] = useState("");
    const [pageContent, setPageContent] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");

    useDynamicFilter(false);
    useCurrentRoute("/manage/page");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const editor = useRef(null);

    const config = useMemo(() => ({
        readonly: false,
        theme: themeType,
        placeholder: ''
    }),
        [themeType]
    );

    //fetch details by pageId
    useEffect(() => {
        if (pageId) {
            setLoading(true);
            ApiService.get(`/api/v1/page/info/${pageId}`, loginData?.token, navigate)
                .then(data => {
                    if (data?.message) {
                        setPageTitle(data?.message?.pageTitle);
                        setPageContent(data?.message?.pageContent);
                        setIsPublished(data?.message?.isPublished);
                    } else {
                        setPageTitle("");
                        setPageContent("");
                        setIsPublished(true);
                    }
                })
                .catch((error) => {
                    if (!error.handled) makeToast("error", "Can not fetch the page details.");
                }).finally(() => {
                    setLoading(false);
                });
        } else {
            setPageTitle("");
            setPageContent("");
        }
    }, [pageId, loginData?.token, navigate, setLoading]);

    const handleFormSubmit = () => {

        if (!pageTitle) {
            makeToast("warning", "Page title must not be empty.");
            return;
        }

        setLoading(true);

        ApiService.post('/api/v1/page/save', { pageId, pageTitle, pageContent, publish: isPublished }, loginData?.token, navigate)
            .then(() => {
                setPageTitle("");
                setPageContent("");
                makeToast("success", "Page saved.");
                setReloadData(true);
                setIsPublished(true);
                navigate(-1);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Can not save the page.");
            }).finally(() => {
                setLoading(false);
            });

    };


    return (
        <>
            <Helmet>
                <title>{!pageId ? "Add a new page" : "Edit a page"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!pageId ? "Add a new page" : "Edit a page"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "Pages", "linkUrl": "/manage/page" }]} />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NiceInput
                            label="Page Title"
                            value={pageTitle}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setPageTitle(e.target.value)}
                            placeholder="Enter page title"
                        />
                        <div className="mb-4">
                            <label className="block mb-2" htmlFor="pageContent">
                                Page Content
                            </label>
                            <JoditEditor
                                ref={editor}
                                style={{ height: '300px' }}
                                value={pageContent}
                                config={config}
                                onBlur={newContent => setPageContent(newContent)}
                            />
                        </div>
                        <NiceCheckbox
                            label='Publish'
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
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

const MemoizedComponent = React.memo(EditPage);
export default MemoizedComponent;