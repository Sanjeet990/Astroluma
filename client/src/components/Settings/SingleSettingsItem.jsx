import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const SingleSettingsItem = ({ Setting, onSelect }) => {

  const onSettingSelection = useCallback(() => {
    onSelect(Setting);
  }, [onSelect, Setting]);

  return (
    <div role="button" className="relative cursor-pointer" onClick={onSettingSelection}>
      <motion.div 
        whileHover={{ scale: 1.03 }} 
        className={`relative flex border-2 ${Setting.featured ? 'border-buttonSuccess' : 'border-itemCardBorder'} bg-itemCardBg text-itemCardText rounded-xl shadow-md h-44 transition-all duration-300`} 
        style={{ overflow: 'hidden' }}
      >
        <div className={`w-4/12 ${Setting.featured ? 'bg-buttonSuccess' : 'bg-itemCardHoverBg'} flex items-center justify-center`}>
          {
            Setting?.icon && <div className={`text-4xl ${Setting.featured ? 'text-white' : ''}`}>
              {
                Setting?.icon
              }
            </div>
          }
        </div>
        <div className="w-8/12 flex items-center">
          <div className="p-4">
            <div className="text-xl font-semibold">{Setting.title}</div>
            <div className="text-xs mt-2">{Setting.description}</div>
            {Setting.featured && (
              <div className="mt-3">
                <span className="px-2 py-1 bg-buttonSuccess text-white text-xs rounded-full">
                  Main Feature
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

SingleSettingsItem.displayName = 'SingleSettingsItem';

SingleSettingsItem.propTypes = {
  Setting: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired
};

const MemoizedComponent = React.memo(SingleSettingsItem);
export default MemoizedComponent;
