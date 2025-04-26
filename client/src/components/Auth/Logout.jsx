import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { colorThemeState, loginState } from "../../atoms";


const Logout = () => {
    const navigate = useNavigate();
    const setLoginState = useSetRecoilState(loginState);
    const setColorTheme = useSetRecoilState(colorThemeState);

    useEffect(() => {
        setLoginState(null);
        setColorTheme("dark");
        navigate("/login");
    }, []);

    return (
        <>
        </>
    );
}

export default Logout;