import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, reloadDashboardDataState } from '../../atoms';
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

const EditUser = () => {

    const params = useParams();

    const userId = params?.userId;

    const navigate = useNavigate();

    const setLoading = useSetRecoilState(loadingState);
    const setReloadData = useSetRecoilState(reloadDashboardDataState);
    const loginData = useRecoilValue(loginState);

    const [fullName, setFullName] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [rpassword, setRPassword] = useState("");
    const [siteName, setSiteName] = useState("");

    useDynamicFilter(false);
    useCurrentRoute("/manage/accounts");

    useEffect(() => {
        if (userId) {
            setLoading(true);
            ApiService.get(`/api/v1/accounts/info/${userId}`, loginData?.token, navigate)
                .then(data => {
                    if (data?.message) {
                        setFullName(data?.message?.fullName);
                        setUserName(data?.message?.username);
                        setSiteName(data?.message?.siteName);
                    } else {
                        setFullName("");
                        setUserName("");
                        setPassword("");
                        setRPassword("");
                        setSiteName("");
                    }
                })
                .catch((error) => {
                    if (!error.handled) makeToast("error", "Failed to fetch account details.");
                }).finally(() => {
                    setLoading(false);
                });
        } else {
            setFullName("");
            setUserName("");
            setPassword("");
            setRPassword("");
            setSiteName("");
        }
    }, [userId, loginData?.token, navigate, setLoading]);

    const handleFormSubmit = () => {

        if (!fullName || !username || !siteName) {
            makeToast("warning", "Please fill all the fields");
            return;
        }

        if (!userId) {
            if (password !== rpassword) {
                makeToast("warning", "Passwords do not match");
                return;
            }

            if (password.length < 6) {
                makeToast("warning", "Password should be atleast 6 characters long");
                return;
            }
        }

        setLoading(true);
        ApiService.post('/api/v1/accounts/save', { userId, username, fullName, password, siteName }, loginData?.token, navigate)
            .then(() => {
                setFullName("");
                setUserName("");
                setPassword("");
                setRPassword("");
                setSiteName("");
                makeToast("success", "Account saved.");
                setReloadData(true);
                navigate(-1);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to save account.");
            }).finally(() => {
                setLoading(false);
            });

    };

    return (
        <>
            <Helmet>
                <title>{!userId ? "Add a new user" : "Edit an user"}</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={!userId ? "Add a new user" : "Edit an user"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }, { "id": "2", "linkName": "User Accounts", "linkUrl": "/manage/accounts" }]} />

            <div className="max-w-4xl mx-auto w-full mt-4">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <NiceForm onSubmit={handleFormSubmit}>
                        <NiceInput
                            label="Full Name"
                            value={fullName}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                        />
                        {
                            !userId && <>

                                <NiceInput
                                    label="User Name"
                                    value={username}
                                    className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                    onChange={(e) => setUserName(e.target.value?.toLowerCase())}
                                    placeholder="Enter user name"
                                />
                                <NiceInput
                                    label="Password"
                                    type="password"
                                    value={password}
                                    className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                />
                                <NiceInput
                                    label="Repeat Password"
                                    type="password"
                                    value={rpassword}
                                    className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                                    onChange={(e) => setRPassword(e.target.value)}
                                    placeholder="Enter repeat password"
                                />
                            </>
                        }
                        <NiceInput
                            label="Site Name"
                            value={siteName}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="Enter site name"
                        />
                        <div className="flex justify-end">
                            <NiceBack />

                            <NiceButton
                                label="Save"
                                className="bg-buttonSuccess text-buttonText"
                                onClick={handleFormSubmit}
                            />
                        </div>
                    </NiceForm>
                </div>
            </div>
        </>
    );
};


const MemoizedComponent = React.memo(EditUser);
export default MemoizedComponent;