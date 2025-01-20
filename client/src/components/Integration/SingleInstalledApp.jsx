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

    return (
        <div role="button" className="relative cursor-pointer">
            <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText pt-10 pb-10 rounded-xl shadow-md h-80"
                style={{ overflow: 'hidden' }}
            >
                <div className="absolute top-0 right-0 flex items-center gap-2 p-2 m-2">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${npmStatus.color}`}>
                        {npmStatus.text}
                    </span>
                    <div
                        title="Remove"
                        role="button"
                        onClick={() => handleAppRemove(app)}
                        className={`cursor-pointer opacity-50 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor ${!isSuperAdmin ? 'hidden' : ''}`}
                    >
                        <FiTrash size={20} />
                    </div>
                </div>
                <div className='flex items-center justify-center p-8'>
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
                <div className='flex flex-col items-center justify-center'>
                    <div className='text-center overflow-hidden'>
                        {app.appName}
                    </div>
                    <div className="mt-4 flex flex-col items-center justify-center gap-1 hidden">
                        {
                            <>
                                {
                                    configRequired ?
                                        <div className="text-xxs text-red-500">Configuration required</div>
                                        : <div className="text-xxs text-green-500">Configured</div>
                                }
                                <NiceButton
                                    label="Configure"
                                    disabled={!configRequired}
                                    onClick={handleConfigureClick}
                                    className="bg-blue-500 hover:bg-blue-600"
                                />
                            </>
                        }
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