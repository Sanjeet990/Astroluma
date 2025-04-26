import React, { useEffect, useState } from "react";
import ApiService from "../../utils/ApiService";
import md5 from 'md5';
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { colorThemeState, loadingState, loginState } from "../../atoms";
import NiceForm from "../NiceViews/NiceForm";
import NiceInput from "../NiceViews/NiceInput";
import makeToast from "../../utils/ToastUtils";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const setLoading = useSetRecoilState(loadingState);
    const setLoginState = useSetRecoilState(loginState);
    const setColorTheme = useSetRecoilState(colorThemeState);

    const [oidcEnabled, setOidcEnabled] = useState(false);
    const [oidcConfig, setOidcConfig] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/login/methods", null, navigate)
            .then(data => {
                setOidcEnabled(data?.message?.oidc?.enabled);
                setOidcConfig(data?.message?.oidc?.config);
            })
            .catch((error) => {
                console.log(error);
                if (!error.handled) makeToast("error", "Failed to fetch account details.");
            }).finally(() => {
                setLoading(false);
            });
    }, []);

    const doLogin = (e) => {
        if (e) e.preventDefault();
        
        if (!username) return makeToast("error", "Username must not be empty.");
        if (!password) return makeToast("error", "Password must not be empty.");

        setLoading(true);

        ApiService.post('/api/v1/login', { username: username, password: md5(password) }, null, navigate)
            .then(data => {
                makeToast("success", "Login success.");
                const token = data?.message?.token;
                const loginData = { token, admin: data?.message?.role === 'admin' ? true : false };
                setLoginState(loginData);

                //set theme prefs
                const theme = data?.message?.colorTheme;
                setColorTheme(theme);

                navigate("/");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Login failed. Please check the credentials.");
            }).finally(() => {
                setLoading(false);
                setUsername("");
                setPassword("");
            });
    }

    const soOidcLogin = () => {
        if (!oidcEnabled) return makeToast("error", "OIDC is not enabled.");

        const loginUrl = `${oidcConfig?.authorizationEndpoint}?client_id=${oidcConfig?.clientId}&redirect_uri=${oidcConfig?.redirectUri}&response_type=code&scope=${oidcConfig?.scope}`;
        if (!loginUrl) return makeToast("error", "OIDC config is not set.");

        window.location.href = loginUrl;
    }

    return (
        <div className="flex h-screen items-center justify-center w-full bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full md:w-96 border border-gray-700 text-white mx-4 backdrop-blur-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-emerald-400">Welcome Back</h2>
                    <p className="text-gray-400 mt-2">Sign in to your account</p>
                </div>
                
                <NiceForm onSubmit={doLogin}>
                    <div className="space-y-5">
                        <NiceInput
                            label="Username"
                            value={username}
                            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                            onChange={(e) => setUsername(e.target.value?.toLowerCase())}
                            placeholder="Enter your username"
                        />
                        
                        <NiceInput
                            label="Password"
                            type="password"
                            value={password}
                            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                        
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                onClick={doLogin}
                            >
                                Log In
                            </button>
                        </div>
                    </div>
                    
                    {oidcEnabled && (
                        <>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-600"></div>
                                <span className="px-4 text-gray-400 text-sm">OR</span>
                                <div className="flex-grow border-t border-gray-600"></div>
                            </div>
                            
                            <div>
                                <button
                                    type="button"
                                    className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    onClick={soOidcLogin}
                                >
                                    Login with OIDC
                                </button>
                            </div>
                        </>
                    )}
                </NiceForm>
            </div>
        </div>
    );
}

const MemoizedComponent = React.memo(Login);
export default MemoizedComponent;