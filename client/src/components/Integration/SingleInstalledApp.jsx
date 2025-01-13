import React from 'react';
import { motion } from 'framer-motion';
import ImageView from '../Misc/ImageView'
import PropTypes from 'prop-types';
import { FiTrash } from 'react-icons/fi';

const SingleInstalledApp = ({ app, handleAppRemove }) => {

    return (
        <div role="button" className="relative cursor-pointer">
            <motion.div whileHover={{ scale: 1.03 }} className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText pt-10 pb-10 rounded-xl shadow-md h-80" style={{ overflow: 'hidden' }} >
                <div
                    title="Delete"
                    role="button"
                    onClick={() => handleAppRemove(app)}
                    className="absolute top-0 right-0 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ml-8 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                >
                    <FiTrash size={20} />
                </div>
                <div className='flex items-center justify-center p-8'>
                    <div className="flex items-center justify-center bg-white/50 rounded-full" style={{ height: '120px', width: '120px' }}>
                        <ImageView alt={app.appName} parent="apps" src={`${app.appIcon}`} height="80px" width="80px" defaultSrc="/apps.png" errorSrc="/apps.png" />
                    </div>
                </div>
                <div className='flex items-center justify-center text-center overflow-hidden !min-h-20 !max-h-20'>{app.appName}</div>
            </motion.div>
        </div>
    );
};

SingleInstalledApp.propTypes = {
    app: PropTypes.object,
    handleAppRemove: PropTypes.func
};

const MemoizedComponent = React.memo(SingleInstalledApp);
export default MemoizedComponent;