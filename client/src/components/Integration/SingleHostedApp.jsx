import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ImageView from '../Misc/ImageView'
import NiceButton from '../NiceViews/NiceButton';
import PropTypes from 'prop-types';
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import makeToast from '../../utils/ToastUtils';

const SingleHostedApp = ({
    app,
    isInstalled,
    StatusIcon,
    hasUpdate,
    installedVersion
}) => {
    const navigate = useNavigate();
    const [isInstalling, setIsInstalling] = useState(false);
    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);

    const handleHomepage = () => {
        window.open(app.repoLink, '_blank');
    };

    const doInstallIntegration = () => {
        setIsInstalling(true);

        ApiService.get(`/api/v1/app/${app.appId}/install`, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Integration installed.");
                navigate("/manage/apps");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", error?.response?.data?.message || "Integration cannot be installed.");
            })
            .finally(() => {
                setLoading(false);
                setIsInstalling(false);
            });
    }
    const doUpdateIntegration = () => {
        setIsInstalling(true);

        ApiService.get(`/api/v1/app/${app.appId}/update`, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Integration updated.");
                navigate("/manage/apps");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", error?.response?.data?.message || "Integration cannot be updated.");
            })
            .finally(() => {
                setLoading(false);
                setIsInstalling(false);
            });
    }

    return (
        <div role="button" className="relative cursor-pointer">
            <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText p-6 rounded-xl shadow-md"
                style={{ minHeight: '380px' }}
            >
                <div className="absolute top-0 right-0 flex items-center space-x-2 p-2 m-2">
                    {isInstalled && StatusIcon && (
                        <div
                            onClick={doUpdateIntegration}
                            className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                            title={hasUpdate ? `Update available (${app.version})` : 'Up to date'}
                        >
                            <StatusIcon
                                size={16}
                                className={hasUpdate ? 'text-yellow-500' : 'text-green-500'}
                            />
                        </div>
                    )}
                    <div
                        title="Homepage"
                        role="button"
                        onClick={handleHomepage}
                        className="cursor-pointer opacity-50 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                    >
                        <FaHome size={20} />
                    </div>
                </div>

                <div className='flex items-center justify-center mb-4'>
                    <div className="flex items-center justify-center bg-white/50 rounded-full" style={{ height: '120px', width: '120px' }}>
                        <ImageView
                            alt={app.appName}
                            parent="apps"
                            src={`${app.appIcon}`}
                            height="80px"
                            width="80px"
                            defaultSrc="/apps.png"
                            errorSrc="/apps.png"
                        />
                    </div>
                </div>

                <div className=''>
                    <div className='text-lg font-semibold text-center'>{app.appName}</div>
                    <div className='text-xxs mb-3 text-center'>{app.appId}</div>
                    <div className='text-xs text-internalCardText/60'>
                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>Version:</span>
                            <span>
                                {isInstalled ? (
                                    <>
                                        {installedVersion}
                                        {hasUpdate && (
                                            <span className="ml-1 text-yellow-500">
                                                → {app.version}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    app.version
                                )}
                            </span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>ID:</span>
                            <span className='text-right'>{app.appId}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>License:</span>
                            <span>{app.licenseName}</span>
                        </div>

                        <div className='mt-4 text-xs text-internalCardText/80 line-clamp-3 min-h-[4em]'>
                            {app.description}
                        </div>

                        <NiceButton
                            onClick={isInstalled && hasUpdate ? doUpdateIntegration : doInstallIntegration}
                            label={
                                isInstalled
                                    ? hasUpdate
                                        ? "Update Available"
                                        : "Installed"
                                    : isInstalling
                                        ? 'Installing...'
                                        : 'Install'
                            }
                            disabled={isInstalled && !hasUpdate || isInstalling}
                            parentClassname="w-full"
                            className={`mt-6 w-full ${isInstalled
                                    ? hasUpdate
                                        ? "bg-yellow-500 text-white"
                                        : "bg-buttonGeneric text-buttonText"
                                    : "bg-buttonGeneric text-buttonText"
                                }`}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

SingleHostedApp.propTypes = {
    app: PropTypes.object.isRequired,
    isInstalled: PropTypes.bool,
    StatusIcon: PropTypes.elementType,
    hasUpdate: PropTypes.bool,
    installedVersion: PropTypes.string
};

const MemoizedComponent = React.memo(SingleHostedApp);
export default MemoizedComponent;