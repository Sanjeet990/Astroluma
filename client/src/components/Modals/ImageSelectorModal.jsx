import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { iconPackState, imageModalState, selectedImageState } from '../../atoms';
import NiceModal from '../NiceViews/NiceModal';
import NiceTab from '../NiceViews/NiceTab';
import PropTypes from 'prop-types';
import MyIconsSection from '../Icons/MyIconsSection';
import CustomIconPack from '../Icons/CustomIconPack';

const ImageSelectorModal = ({ title }) => {
  const [modalState, setModalState] = useRecoilState(imageModalState);
  const [tabConfig, setTabConfig] = useState([]);

  const setSelectedImage = useSetRecoilState(selectedImageState);

  const allIconPacks = useRecoilValue(iconPackState);

  const [activeTab, setActiveTab] = useState("com.astroluma.self");

  useEffect(() => {
    setActiveTab("com.astroluma.self");
  }, [modalState.isOpen]);

  useEffect(() => {
    const tempItemArray = allIconPacks.map(pack => ({
      name: pack.iconProvider,
      label: pack.iconName
    }));
    tempItemArray.unshift({ name: 'com.astroluma.self', label: 'My Icons' });
    setTabConfig(tempItemArray);
  }, [allIconPacks]);

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    closeModal();
  };

  const handleTabSelection = (tabName) => {
    setActiveTab(tabName);
  }

  return (
    <NiceModal
      title={title || "Select Image"}
      show={modalState.isOpen}
      closeModal={closeModal}
      body={
        <>
          <NiceTab tabConfig={tabConfig} activeTab={activeTab} setActiveTab={handleTabSelection} />

          <div className="mt-4">
            {
              activeTab === "com.astroluma.self" && <MyIconsSection onSelectImage={handleSelectImage} />
            }
            {
              allIconPacks.map(iconPack => (
                iconPack.iconProvider === activeTab && (
                  <CustomIconPack key={iconPack.iconProvider} iconPack={iconPack} onSelectImage={handleSelectImage} />
                )
              ))
            }
          </div>
        </>
      }
    />
  );
};

ImageSelectorModal.propTypes = {
  title: PropTypes.string
};

export default React.memo(ImageSelectorModal);