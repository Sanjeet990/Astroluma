import React, { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isHostModeState, loadingState, loginState, reloadDashboardDataState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import makeToast from '../../utils/ToastUtils';
import NiceBack from '../NiceViews/NiceBack';
import { Helmet } from 'react-helmet';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';

const GeneralSettings = () => {

    const setActiveRoute = useCurrentRoute();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);
    const isHostMode = useRecoilValue(isHostModeState);

    const [siteName, setSiteName] = useState('');
    const [authenticator, setAuthenticator] = useState(false);
    const [camerafeed, setCamerafeed] = useState(false);
    const [todolist, setTodolist] = useState(false);
    const [snippetmanager, setSnippetManager] = useState(false);
    const [networkdevices, setNetworkdevices] = useState(false);

    useDynamicFilter(false);
    
    useEffect(() => {
        setActiveRoute("/manage/general");
    }, [setActiveRoute]);

    const saveSettings = () => {
        //validate data
        if (!siteName) {
            return makeToast("warning", "Site name is required");
        }

        //send data to save
        setLoading(true);
        ApiService.post("/api/v1/settings", { siteName, authenticator, camerafeed, networkdevices, todolist, snippetmanager }, loginData?.token)
            .then(() => {
                makeToast("success", "Details saved successfully.");
                setReloadData(true);
            })
            .catch(() => {
                makeToast("error", "Failed to save settings.");
            }).finally(() => {
                setLoading(false);
            });
    }

    //fetch the settings to prefill in form
    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/settings", loginData?.token)
            .then(data => {
                setSiteName(data?.message?.siteName);
                setAuthenticator(data?.message?.authenticator);
                setCamerafeed(data?.message?.camerafeed);
                setNetworkdevices(data?.message?.networkdevices);
                setTodolist(data?.message?.todolist);
                setSnippetManager(data?.message?.snippetmanager);
            })
            .catch(() => {
                makeToast("error", "Failed to fetch settings.");
            }).finally(() => {
                setLoading(false);
            });
    }, [loginData, setLoading]);


    return (
        <>
            <Helmet>
                <title>General Settings</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"General Settings"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="max-w-4xl mx-auto w-full">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <div className="mt-4">
                        <NiceInput
                            label="Site Name"
                            value={siteName}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="Enter site name"
                        />

                        <NiceCheckbox
                            label="Enable Todo List"
                            checked={todolist}
                            onChange={(e) => setTodolist(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable Snippet Manager"
                            checked={snippetmanager}
                            onChange={(e) => setSnippetManager(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable Stream Hub"
                            checked={camerafeed}
                            onChange={(e) => setCamerafeed(e.target.checked)}
                        />

                        <NiceCheckbox
                            label='Enable Network Device Scanning'
                            checked={networkdevices}
                            disabled={!isHostMode}
                            onChange={(e) => setNetworkdevices(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable TOTP Authenticator"
                            checked={authenticator}
                            onChange={(e) => setAuthenticator(e.target.checked)}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <NiceBack />

                        <NiceButton
                            label="Save"
                            className="bg-buttonSuccess text-buttonText"
                            onClick={saveSettings}
                        />

                    </div>
                </div>
            </div>
        </>
    );
};

const MemoizedComponent = React.memo(GeneralSettings);
export default MemoizedComponent;
