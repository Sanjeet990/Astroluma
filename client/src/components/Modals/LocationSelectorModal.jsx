import React, { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { weatherLocationSearchModalState, weatherLocationSelectedState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceModal from '../NiceViews/NiceModal';
import NiceLoader from '../NiceViews/NiceLoader';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const LocationSelectorModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(weatherLocationSearchModalState);
  const setSelectedLocation = useSetRecoilState(weatherLocationSelectedState);
  const [isLoading, setIsLoading] = useState(false);
  const [inputLocation, setInputLocation] = useState('');
  const [locationList, setLocationList] = useState([]);

  useEffect(() => {
    setLocationList([]);
    setInputLocation("");
  }, [modalState]);

  const closeModal = () => {
    setModalState(false);
  };

  const handleInputSelection = (e) => {
    setInputLocation(e.target.value);
  };

  const doActualSearch = () => {
    //if searchquery is less than 3 characters
    if (inputLocation.length < 3) {
      return makeToast("info", "Location name must be atleast 2 characters long.");
    }

    setIsLoading(true);

    //search for location
    ApiService.get(`https://nominatim.openstreetmap.org/search?q=${inputLocation}&format=json&limit=5`, null, navigate)
      .then(data => {
        setLocationList(data);
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Can not load locations.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  };

  const manageLocationSelection = (selectedLocation) => {
    const location = {
      location: selectedLocation.name,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lon
    }
    setSelectedLocation(location);
    setModalState(false);
  }

  return (
    <NiceModal
      title='Select Location'
      show={modalState}
      closeModal={closeModal}
      body={
        <NiceInput
          label='Search Location'
          value={inputLocation}
          className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
          onChange={handleInputSelection}
          placeholder='Search Location'
        />
      }
      footer={
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex justify-end">
            <NiceButton
              label='Cancel'
              className="bg-buttonDanger text-buttonText"
              onClick={closeModal}
            />
            <NiceButton
              label='Search'
              className="bg-buttonSuccess text-buttonText"
              onClick={doActualSearch}
            />
          </div>
          <div className="w-full">
            {
              isLoading ?
                <div className='w-full flex justify-center items-center'>
                  <div className="flex flex-col mt-4 justify-center items-center p-4 shadow">
                    <div className="text-center mt-4">
                      <NiceLoader className='text-loaderColor' />
                    </div>
                    <p className="mt-4 text-center">Loading...</p>
                  </div>
                </div> :
                locationList.length > 0 && <div className='p-4 mt-4 overflow-y-auto overflow-x-hidden max-h-64'>
                  {
                    locationList.map((location, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <p className="text-xs">{location.display_name}</p>
                        <NiceButton
                          label='Select'
                          className="bg-buttonGeneric text-buttonText"
                          onClick={() => manageLocationSelection(location)}
                        />
                      </div>
                    ))
                  }
                </div>
            }
          </div>
        </div>
      } />
  );
}

const MemoizedComponent = React.memo(LocationSelectorModal);
export default MemoizedComponent;
