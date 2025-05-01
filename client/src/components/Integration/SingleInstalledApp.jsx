import React from 'react';
import { motion } from 'framer-motion';
import ImageView from '../Misc/ImageView';
import PropTypes from 'prop-types';
import { FiTrash } from 'react-icons/fi';
import NiceButton from '../NiceViews/NiceButton';
import { useRecoilValue } from 'recoil';
import { userDataState } from '../../atoms';

const SingleInstalledApp = ({ app, handleAppRemove, configurationHandler }) => {
    const userData = useRecoilValue(userDataState);
    const isSuperAdmin = userData?.isSuperAdmin;

    // Determine npm status and color
    const getNpmStatus = () => {
        switch (app.npmInstalled) {
            case 0:
                return { text: 'Installing', color: 'bg-orange-500' };
            case 1:
                return { text: 'Installed', color: 'bg-green-500' };
            case -1:
                return { text: 'Errored', color: 'bg-red-500' };
            default:
                return { text: 'Unknown', color: 'bg-gray-500' };
        }
    };

    // Determine ready status
    const getConfigRequired = () => {
        if (app.coreSettings === true && app.configured === false) {
            return true;
        } else {
            return false;
        }
    };

    const npmStatus = getNpmStatus();
    const configRequired = getConfigRequired();

    const handleConfigureClick = () => {
        configurationHandler(app);
    };

    // Determine if app can be uninstalled or its updates can be removed
    const canUninstall = app.appType === 'user';
    const hasUpdates = app.appType === 'system' && app.isUpdated === 1;

    return (
        <div role="button" className="relative cursor-pointer">
            <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText p-6 rounded-xl shadow-md"
                style={{ minHeight: '380px' }}
            >
                <div className="absolute top-0 right-0 flex items-center space-x-2 p-2 m-2">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${npmStatus.color}`}>
                        {npmStatus.text}
                    </span>
                    {isSuperAdmin && canUninstall && (
                        <div
                            title="Remove"
                            role="button"
                            onClick={() => handleAppRemove(app)}
                            className="cursor-pointer opacity-50 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                        >
                            <FiTrash size={20} />
                        </div>
                    )}
                </div>

                <div className='flex items-center justify-center mb-4'>
                    <div className="flex items-center justify-center bg-white/50 rounded-full" style={{ height: '120px', width: '120px' }}>
                        <ImageView
                            alt={app.appName}
                            parent={""}
                            src={`api/v1/app/${app.appId}/logo`}
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
                            <span>{app.version}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>ID:</span>
                            <span className='text-right'>{app.appId}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-internalCardText/60'>Type:</span>
                            <span className={`px-1 rounded ${app.appType === 'system' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                                {app.appType === 'system' ? 'System App' : 'User App'}
                            </span>
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
    configurationHandler: PropTypes.func
};

const MemoizedComponent = React.memo(SingleInstalledApp);
export default MemoizedComponent;