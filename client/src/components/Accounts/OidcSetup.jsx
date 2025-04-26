import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import NicePreferenceHeader from "../NiceViews/NicePreferenceHeader";
import NiceInput from "../NiceViews/NiceInput";
import NiceButton from "../NiceViews/NiceButton";
import NiceBack from "../NiceViews/NiceBack";
import { useNavigate } from "react-router-dom";
import useCurrentRoute from "../../hooks/useCurrentRoute";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loadingState, loginState } from "../../atoms";
import useDynamicFilter from "../../hooks/useDynamicFilter";
import makeToast from "../../utils/ToastUtils";
import ApiService from "../../utils/ApiService";
import NiceCheckbox from "../NiceViews/NiceCheckbox";

const OidcSetup = () => {

    const navigate = useNavigate();

    const setActiveRoute = useCurrentRoute();

    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    const [issuerUrl, setIssuerUrl] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [redirectUri, setRedirectUri] = useState("");
    const [scope, setScope] = useState("");
    const [authorizationEndpoint, setAuthorizationEndpoint] = useState("");
    const [tokenEndpoint, setTokenEndpoint] = useState("");
    const [userinfoEndpoint, setUserinfoEndpoint] = useState("");
    const [jwksUri, setJwksUri] = useState("");
    const [logoutUri, setLogoutUri] = useState("");
    const [userIdentifier, setUserIdentifier] = useState("");
    const [autoUserProvisioning, setAutoUserProvisioning] = useState(false);
    const [enableOidcAuth, setEnableOidcAuth] = useState(false);

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute("/manage/oidc");
    }, [setActiveRoute]);

    const validateFields = (fields) => {
        for (const [key, value] of Object.entries(fields)) {
            if (!value) {
                return ` ${key.replace(/([A-Z])/g, ' $1')} is required`;
            }
        }
        return null;
    };

    const saveSettings = () => {
        //validate data
        const fields = {
            "Issuer Url": issuerUrl,
            "Client Id": clientId,
            "Client Secret": clientSecret,
            "Redirect URL": redirectUri,
            "Scope": scope,
            "Authorization Endpoint": authorizationEndpoint,
            "Token Endpoint": tokenEndpoint,
            "Userinfo Endpoint": userinfoEndpoint,
            "Jwks Uri": jwksUri,
            "Logout URL": logoutUri
        };

        const errorMessage = validateFields(fields);
        if (errorMessage) {
            return makeToast("warning", errorMessage);
        }

        const dataToSend = {
            issuerUrl,
            clientId,
            clientSecret,
            redirectUri,
            scope,
            authorizationEndpoint,
            tokenEndpoint,
            userinfoEndpoint,
            jwksUri,
            logoutUri,
            autoUserProvisioning,
            userIdentifier,
            enableOidcAuth
        }

        //send data to save
        setLoading(true);
        ApiService.post("/api/v1/settings/oidc", dataToSend, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Details saved successfully.");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to save settings.");
            }).finally(() => {
                setLoading(false);
            });
    }


    //fetch the settings to prefill in form
    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/settings/oidc", loginData?.token, navigate)
            .then(data => {
                setIssuerUrl(data?.message?.issuerUrl);
                setClientId(data?.message?.clientId);
                setClientSecret(data?.message?.clientSecret);
                setRedirectUri(data?.message?.redirectUri);
                setScope(data?.message?.scope);
                setAuthorizationEndpoint(data?.message?.authorizationEndpoint);
                setTokenEndpoint(data?.message?.tokenEndpoint);
                setUserinfoEndpoint(data?.message?.userinfoEndpoint);
                setJwksUri(data?.message?.jwksUri);
                setLogoutUri(data?.message?.logoutUri);
                setAutoUserProvisioning(data?.message?.autoUserProvisioning);
                setUserIdentifier(data?.message?.userIdentifier);
                setEnableOidcAuth(data?.message?.enableOidcAuth);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to fetch settings.");
            }).finally(() => {
                setLoading(false);
            });
    }, [loginData, setLoading, navigate]);


    return (
        <>
            <Helmet>
                <title>OIDC Setup</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"OIDC Setup"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="max-w-4xl mx-auto w-full">
                <div className="card border bg-cardBg text-cardText border-cardBorder shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                    <div className="mt-4">

                        <NicePreferenceHeader
                            title="Open ID connect configuration" />

                        <NiceInput
                            label="Issuer Url"
                            value={issuerUrl}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setIssuerUrl(e.target.value)}
                            placeholder="Enter issuer Url"
                        />

                        <NiceInput
                            label="Client Id"
                            value={clientId}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="Enter client id"
                        />

                        <NiceInput
                            label="Client Secret"
                            value={clientSecret}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setClientSecret(e.target.value)}
                            placeholder="Enter client secret"
                        />

                        <NiceInput
                            label="Redirect URL"
                            value={redirectUri}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setRedirectUri(e.target.value)}
                            placeholder="Enter redirect URL"
                        />

                        <NiceInput
                            label="Logout URL"
                            value={logoutUri}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setLogoutUri(e.target.value)}
                            placeholder="Enter logout URL"
                        />

                        <NiceInput
                            label="User Identifier"
                            value={userIdentifier}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setUserIdentifier(e.target.value)}
                            placeholder="Enter user identifier"
                        />

                        <NiceInput
                            label="Scope"
                            value={scope}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setScope(e.target.value)}
                            placeholder="Enter scope"
                        />

                        <NiceInput
                            label="Authorization Endpoint"
                            value={authorizationEndpoint}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setAuthorizationEndpoint(e.target.value)}
                            placeholder="Enter authorization endpoint"
                        />

                        <NiceInput
                            label="Token Endpoint"
                            value={tokenEndpoint}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setTokenEndpoint(e.target.value)}
                            placeholder="Enter token endpoint"
                        />

                        <NiceInput
                            label="Userinfo Endpoint"
                            value={userinfoEndpoint}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setUserinfoEndpoint(e.target.value)}
                            placeholder="Enter userinfo endpoint"
                        />

                        <NiceInput
                            label="Jwks Uri"
                            value={jwksUri}
                            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                            onChange={(e) => setJwksUri(e.target.value)}
                            placeholder="Enter jwks uri"
                        />

                        <NiceCheckbox
                            label="Auto user provisioning"
                            checked={autoUserProvisioning}
                            onChange={(e) => setAutoUserProvisioning(e.target.checked)}
                        />

                        <NiceCheckbox
                            label="Enable login with OIDC"
                            checked={enableOidcAuth}
                            onChange={(e) => setEnableOidcAuth(e.target.checked)}
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

export default React.memo(OidcSetup);