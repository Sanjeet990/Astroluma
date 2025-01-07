import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import NiceLoader from '../NiceViews/NiceLoader';
import { motion } from 'framer-motion';
import ApiService from '../../utils/ApiService';
import ImageView from '../Misc/ImageView';
import { useRecoilValue } from 'recoil';
import { FiTrash } from 'react-icons/fi';
import { colorThemeState, loginState } from '../../atoms';
import SystemThemes from '../../utils/SystemThemes';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const SingleIconPackItem = ({ iconPack, deleteListener }) => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [icons, setIcons] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [baseUrlLight, setBaseUrlLight] = useState('');
  const [isLightDark, setIsLightDark] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const loginData = useRecoilValue(loginState);

  const colorTheme = useRecoilValue(colorThemeState);
  const [themeType, setThemeType] = useState("light");

  useEffect(() => {
    const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
    setThemeType(newThemeType);
  }, [colorTheme]);

  const onDeleteClicked = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const fetchIcons = useCallback(async () => {
    setLoading(true);

    ApiService.get(iconPack?.jsonUrl)
      .then(data => {
        setIcons(data.iconData?.slice(0, 12));
        setBaseUrl(data?.baseUrl);
        setBaseUrlLight(data?.baseUrlLight);

        if (data?.baseUrlLight && data?.baseUrlLight !== '') {
          setIsLightDark(true);
        } else {
          console.log(data);
        }
      })
      .catch(() => {
        //makeToast("error", "Error loading data...");
      }).finally(() => {
        setLoading(false);
      });
  }, [iconPack?.jsonUrl]);

  useEffect(() => {
    fetchIcons();
  }, [fetchIcons]);


  const decideTheIcon = useCallback((icon) => {
    if (themeType === "dark" && icon?.iconUrlLight) {
      return `${baseUrlLight}${icon?.iconUrlLight}`;
    } else {
      return `${baseUrl}${icon?.iconUrl}`;
    }
  }, [baseUrl, baseUrlLight, themeType]);

  const handleConfirmDelete = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    ApiService.get(`/api/v1/iconpack/delete/${iconPack?._id}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Icon pack deleted successfully.");
        deleteListener(iconPack);
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Icon pack could not be deleted.");
      }).finally(() => {
        setLoading(false);
        setShowDeleteConfirmation(false);
      });
  }, [iconPack, deleteListener, loginData, navigate]);

  const handleCancelDelete = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirmation(false);
  }, []);

  return (
    <div role="button" className={`relative cursor-pointer`}>
      <motion.div whileHover={{ scale: 1.03 }} className="relative border-2 border-itemCardBorder bg-itemCardBg text-itemCardText pt-10 pb-10 rounded-xl shadow-md h-80 transition-all duration-300" style={{ overflow: 'hidden' }}>
        {
          showDeleteConfirmation ? (
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-center">Are you sure you want to delete this icon pack?</p>
              <div className='m-6 flex justify-center space-x-4'>
                <NiceButton
                  label="Yes"
                  className="bg-buttonDanger text-buttonText"
                  onClick={handleConfirmDelete}
                />
                <NiceButton
                  label="No"
                  className="bg-buttonSuccess text-buttonText"
                  onClick={handleCancelDelete}
                />
              </div>
            </div>
          ) : (
            <>
              {
                loading ? <div className="flex flex-col justify-center items-center h-full">
                  <NiceLoader className='text-loaderColor' />
                </div> :
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 flex flex-col justify-center items-center">
                    {
                      iconPack?.userId && <div
                        title="Delete"
                        role="button"
                        onClick={onDeleteClicked}
                        className="absolute top-0 right-0 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ml-8 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                      >
                        <FiTrash size={20} />
                      </div>
                    }
                    {
                      icons.map((icon, index) => (
                        <div
                          key={`${icon.iconUrl}-${index}`}
                          className="w-16 h-20 p-2 flex flex-col justify-center items-center duration-300"
                        >
                          <div
                            className='w-16 h-16 flex justify-center items-center p-2'>
                            <ImageView
                              src={decideTheIcon(icon)}
                              alt={icon.iconName}
                              className="w-full h-full object-contain rounded-lg"
                              defaultSrc="/default.png"
                              errorSrc="/default.png"
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
              }
              {
                isLightDark && <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                  <span className="text-xs font-medium">Light / Dark</span>
                </div>
              }
            </>
          )}
      </motion.div>
      <div className='flex items-center justify-center text-center overflow-hidden !min-h-20 !max-h-20'>{iconPack.iconName}</div>
    </div>
  );
};

SingleIconPackItem.displayName = 'SingleIconPackItem';

SingleIconPackItem.propTypes = {
  iconPack: PropTypes.object.isRequired,
  deleteListener: PropTypes.func.isRequired
};


const MemoizedComponent = React.memo(SingleIconPackItem);
export default MemoizedComponent;
