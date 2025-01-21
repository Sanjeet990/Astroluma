import React from 'react';
import WelcomeUser from '../Misc/WelcomeUser';
import WeatherWidget from './WeatherWidget';

const WelcomeHeader = () => {
    return (
        <div className="flex flex-row space-x-4">
            <div className="w-full md:block">
                <div className="flex flex-col md:flex-row items-center justify-between space-x-4">
                    <div className="flex justify-between items-center w-full">
                        <WelcomeUser />
                        
                        <WeatherWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MemoizedComponent = React.memo(WelcomeHeader);
export default MemoizedComponent;