import React, { useCallback, useEffect, useState } from 'react';
import ImageView from './ImageView';
import { useRecoilValue } from 'recoil';
import { colorThemeState, userDataState } from '../../atoms';
import SystemThemes from '../../utils/SystemThemes';

const WelcomeUser = () => {

    const userData = useRecoilValue(userDataState);

    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const decideTheIcon = useCallback(() => {
        const iconObject = userData?.userAvatar;
        if (themeType === "dark" && iconObject?.iconUrlLight) {
            return iconObject?.iconUrlLight;
        } else {
            return iconObject?.iconUrl;
        }
    }, [userData, themeType]);

    return (
        <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16">
                <ImageView src={decideTheIcon()} alt="User avatar" className="h-16 w-16 rounded-full" />
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl text-welcomeText">Welcome Back</h2>
                <p className="text-xs sm:text-sm text-welcomeUsernameText">{userData?.fullName}</p>
            </div>
        </div>
    );
};

const MemoizedComponent = React.memo(WelcomeUser);
export default MemoizedComponent;