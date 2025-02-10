import React, { useState } from "react";
import ApiService from "../../utils/ApiService";
import md5 from 'md5';
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { colorThemeState, loadingState, loginState } from "../../atoms";
import NiceForm from "../NiceViews/NiceForm";
import NiceButton from "../NiceViews/NiceButton";
import NiceInput from "../NiceViews/NiceInput";
import makeToast from "../../utils/ToastUtils";

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const setLoading = useSetRecoilState(loadingState);
    const setLoginState = useSetRecoilState(loginState);

    const setColorTheme = useSetRecoilState(colorThemeState);

    const navigate = useNavigate();


    const doLogin = () => {
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

                //if (data?.message?.role === 'admin') navigate("/admin/dashboard");
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

    return (
        <div className="flex h-screen items-center justify-center w-full">
            <div className="bg-noListingCardBg p-8 rounded-xl shadow-md w-full md:w-96 border border-noListingCardBorder text-noListingCardText mx-4">
            <div className="absolute top-0 right-0 mt-4 mr-4" />
                <h2 className="text-2xl  mb-4">Login</h2>
                <NiceForm onSubmit={doLogin}>
                    <NiceInput
                        label="Username"
                        value={username}
                        className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                        onChange={(e) => setUsername(e.target.value?.toLowerCase())}
                        placeholder="Enter your username"
                    />
                    <NiceInput
                        label="Password"
                        type="password"
                        value={password}
                        className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                    
                    <div className="flex items-center justify-end mt-4">
                        <NiceButton
                            label="Log In"
                            className="bg-buttonSuccess text-buttonText ml-auto"
                            onClick={doLogin}
                        />
                    </div>
                </NiceForm>
            </div>
        </div>
    );
}


const MemoizedComponent = React.memo(Login);
export default MemoizedComponent;
