import React, { useEffect, useState, useCallback } from 'react';
import RTSPPlayer from './RTSPPlayer';
import ApiService from '../../utils/ApiService';
import { useRecoilState, useRecoilValue } from 'recoil';
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { loginState, quickPreviewStreamState, selectedStreamsState } from '../../atoms';
import NiceLoader from '../NiceViews/NiceLoader';
import PropTypes from 'prop-types';

const SingleFeed = ({ videoItem }) => {
  const loginData = useRecoilValue(loginState);
  const [imagePreview, setImagePreview] = useState("/footage.png");
  const [blurPreview, setBlurPreview] = useState("/footage.png");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [tempPreview, setTempPreview] = useState(false);

  const [quickPreviewStream, setQuickPreviewStream] = useRecoilState(quickPreviewStreamState);
  const [selectedStreams, setSelectedStreams] = useRecoilState(selectedStreamsState);

  const isSelected = selectedStreams.find(item => item.id === videoItem.id);

  const loadImagePreview = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getImage(`/api/v1/listing/stream/preview/${videoItem.id}`, loginData?.token);

      if (!data || data === "data:image/jpeg;base64,") {
        setImagePreview("/nopreview.png");
        setBlurPreview("/footage.png");

        // Retry after 3 seconds if we haven't exceeded retry attempts
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
        }
      } else {
        setImagePreview(data);
        setBlurPreview(data);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error) {
      setImagePreview("/nopreview.png");
      setBlurPreview("/footage.png");

      // Retry after 3 seconds if we haven't exceeded retry attempts
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [videoItem.id, loginData?.token, retryCount]);

  useEffect(() => {
    if (quickPreviewStream === videoItem.id) {
      setTempPreview(true);
    } else {
      setTempPreview(false);
    }
  }, [quickPreviewStream, videoItem.id]);

  useEffect(() => {
    loadImagePreview();
  }, [loadImagePreview]);

  const manageSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlySelected = selectedStreams.some(item => item.id === videoItem.id);

    if (isCurrentlySelected) {
      // Remove the item if it's already selected
      setSelectedStreams(selectedStreams.filter(item => item.id !== videoItem.id));
    } else {
      if (selectedStreams.length < 4) {
        // If less than 3 items, just add the new item
        setSelectedStreams([...selectedStreams, { ...videoItem, timestamp: Date.now() }]);
      } else {
        // If 3 or more items, remove the oldest and add the new item
        const sortedByTimestamp = [...selectedStreams].sort((a, b) => a.timestamp - b.timestamp);
        sortedByTimestamp.shift(); // Remove the oldest record
        setSelectedStreams([...sortedByTimestamp, { ...videoItem, timestamp: Date.now() }]);
      }
    }
  }

  const clickedForPreview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickPreviewStream(videoItem.id);
  }

  return (
    <div
      role='button'
      key={videoItem.id}
      className="relative cursor-pointer"
      onClick={clickedForPreview}
    >
      <div
        className="relative border-2 border-itemCardBorder bg-itemCardBg text-itemCardText p-14 rounded-xl shadow-md h-full"
        style={{ position: 'relative', overflow: 'hidden', height: '360px' }}
      >
        <div className="absolute inset-0 background-image m-0" style={{ width: '100%', height: '100%' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              {/* deepsource-ignore JS-0760 */}
              <img
                src={blurPreview}
                onError={(e) => { e.target.src = '/footage.png'; }}
                alt="bg"
                className="w-full h-full object-cover blur-md"
              />
            </div>
            <div className="relative w-full h-full cursor-pointer" >
              {(!isSelected && !tempPreview) ? (
                <div className="flex items-center justify-center h-full">
                  {/* deepsource-ignore JS-0760 */}
                  {!isLoading ? (
                    <img
                      src={imagePreview}
                      onError={(e) => { e.target.src = '/nopreview.png'; }}
                      alt='preview'
                      className="w-full cursor-pointer"
                    />
                  ) : (
                    <NiceLoader className="text-loaderColor" />
                  )}
                </div>
              ) : (
                <RTSPPlayer videoId={videoItem.id} />
              )}

              <div className="absolute top-3 right-2 flex justify-center items-center bg-red-600 py-0.5 px-1 text-xs rounded-md z-5">
                <img src="/cctv.png" width={12} alt="" />
                <span className='ml-1'>{videoItem?.listingName || "Video"}</span>
              </div>

              <div
                role='button'
                className={`absolute bottom-2 right-2 z-20 ${isSelected ? 'bg-itemCardBorder' : 'bg-black bg-opacity-50'} p-2 rounded-full`}
                onClick={manageSelection}
              >
                {isSelected ? <FaVideo size={18} /> : <FaVideoSlash size={18} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SingleFeed.propTypes = {
  videoItem: PropTypes.object.isRequired,
};

const MemoizedComponent = React.memo(SingleFeed);
export default MemoizedComponent;