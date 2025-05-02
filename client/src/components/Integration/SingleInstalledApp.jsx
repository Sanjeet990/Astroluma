import React from 'react';
import { motion } from 'framer-motion';
import ImageView from '../Misc/ImageView';
import PropTypes from 'prop-types';
import { FiTrash, FiRefreshCw } from 'react-icons/fi';
import NiceButton from '../NiceViews/NiceButton';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, userDataState } from '../../atoms';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiService from '../../utils/ApiService';
import { useNavigate } from 'react-router-dom';
import makeToast from '../../utils/ToastUtils';

const SingleInstalledApp = ({ app, handleAppRemove, configurationHandler, refreshApps }) => {
    const navigate = useNavigate();
    const userData = useRecoilValue(userDataState);
    const isSuperAdmin = userData?.isSuperAdmin;

    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(loadingState);

    // Determine ready status
    const getConfigRequired = () => {
        if (app.coreSettings === true && app.configured === false) {
            return true;
        } else {
            return false;
        }
    };

    const configRequired = getConfigRequired();

    const handleConfigureClick = () => {
        configurationHandler(app);
    };

    const handleReinstallDependencies = async (app) => {
        setLoading(true);
        try {
            const data = await apiService.get(`/api/v1/app/${app.appId}/reinstall-dependencies`, loginData?.token, navigate);
            if (data) {
                makeToast("success", "Dependencies reinstalled successfully.");
            }

        } catch (error) {
            console.error("Error reinstalling dependencies:", error);
            toast.error(error.response?.data?.message || "Error reinstalling dependencies");
        } finally {
            setLoading(false);
        }
    };

    // Determine if app can be uninstalled or its updates can be removed
    const canUninstall = app.appType === 'user';
    const hasUpdates = app.appType === 'system' && app.isUpdated;

    return (
        <div role="button" className="relative cursor-pointer">
            <motion.div
                whileHover={{ scale: 1.03 }}
                className={`relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText p-6 rounded-xl shadow-md`}
                style={{ minHeight: '380px' }}
            >
                {/* Reinstall Dependencies Icon */}
                {isSuperAdmin && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReinstallDependencies(app);
                        }}
                        className="absolute top-2 right-2 p-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity text-internalCardIconColor hover:text-internalCardIconHoverColor"
                        title="Reinstall Dependencies"
                    >
                        <FiRefreshCw size={20} />
                    </div>
                )}

                <div className='flex items-center justify-center mb-4'>
                    <div className="flex items-center justify-center bg-white/50 rounded-full" style={{ height: '120px', width: '120px' }}>
                        <ImageView
                            alt={app.appName}
                            parent={""}
                            src={`http://localhost:8000/api/v1/app/${app.appId}/logo`}
                            height="80px"
                            width="80px"
                            defaultSrc="/apps.png"
                            errorSrc="/apps.png"
                        />
                    </div>
                </div>

                <div className=''>
                    <div className='text-lg font-semibold text-center'>{app.appName}</div>
                    <div className='text-xxs mb-3 text-center'>
                        {app.appId}
                    </div>
                    <div className='text-xs text-internalCardText/60'>
                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>Version:</span>
                            <span>{app.version}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>ID:</span>
                            <span className='text-right'>{app.appId}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>App Type:</span>
                            <span>{app.appType === 'system' ? 'System App' : 'User App'}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>Status:</span>
                            <span>{configRequired ? 'Needs Configuration' : 'Ready'}</span>
                        </div>

                        <div className='mt-4 text-xs text-internalCardText/80 line-clamp-3 min-h-[4em]'>
                            {app.description}
                        </div>

                        <div className="mt-6">
                            {configRequired ? (
                                <NiceButton
                                    onClick={handleConfigureClick}
                                    label="Configure"
                                    parentClassname="w-full"
                                    className="w-full bg-buttonGeneric text-buttonText"
                                />
                            ) : isSuperAdmin ? (
                                app.appType === 'system' ? (
                                    <NiceButton
                                        onClick={hasUpdates ? () => handleAppRemove(app) : undefined}
                                        label={hasUpdates ? "Uninstall Updates" : "System App"}
                                        parentClassname="w-full"
                                        className={`w-full ${hasUpdates ? "bg-yellow-500" : "bg-gray-500 cursor-not-allowed opacity-70"} text-white`}
                                        disabled={!hasUpdates}
                                    />
                                ) : (
                                    <NiceButton
                                        onClick={() => handleAppRemove(app)}
                                        label="Uninstall App"
                                        parentClassname="w-full"
                                        className="w-full bg-red-500 text-white"
                                    />
                                )
                            ) : null}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

SingleInstalledApp.propTypes = {
    app: PropTypes.object,
    handleAppRemove: PropTypes.func,
    configurationHandler: PropTypes.func,
    refreshApps: PropTypes.func
};

const MemoizedComponent = React.memo(SingleInstalledApp);
export default MemoizedComponent;