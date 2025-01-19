import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { iconPackState, imageModalState, selectedImageState } from '../../atoms';
import NiceModal from '../NiceViews/NiceModal';
import NiceTab from '../NiceViews/NiceTab';
import MyIconsSection from '../Icons/MyIconsSection';
import CustomIconPack from '../Icons/CustomIconPack';
import { BrowserRouter } from 'react-router-dom';

const ImageSelectorModal = () => {
  const [modalState, setModalState] = useRecoilState(imageModalState);
  const [tabConfig, setTabConfig] = useState([]);

  const setSelectedImage = useSetRecoilState(selectedImageState);

  const allIconPacks = useRecoilValue(iconPackState);

  const [activeTab, setActiveTab] = useState("com.astroluma.self");

  useEffect(() => {
    setActiveTab("com.astroluma.self");
  }, [modalState.isOpen]);

  useEffect(() => {
    const tempItemArray = allIconPacks?.map(pack => ({
      name: pack.iconProvider,
      label: pack.iconName
    }));
    tempItemArray?.unshift({ name: 'com.astroluma.self', label: 'My Icons' });
    setTabConfig(tempItemArray);
  }, [allIconPacks]);

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectImage = (image) => {
    setSelectedImage({image, data: modalState?.data});
    closeModal();
  };

  const handleTabSelection = (tabName) => {
    setActiveTab(tabName);
  }

  return (
    <NiceModal
      title={modalState?.title || "Select Icon"}
      show={modalState.isOpen}
      closeModal={closeModal}
      body={
        <>
          <NiceTab tabConfig={tabConfig} activeTab={activeTab} setActiveTab={handleTabSelection} />

          <div className="mt-4">
            {
              activeTab === "com.astroluma.self" && <BrowserRouter><MyIconsSection onSelectImage={handleSelectImage} /></BrowserRouter>
            }
            {
              allIconPacks?.map(iconPack => (
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

export default React.memo(ImageSelectorModal);