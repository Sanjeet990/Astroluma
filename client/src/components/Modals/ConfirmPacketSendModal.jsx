import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginState, sendmagicPacketState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import NiceLoader from '../NiceViews/NiceLoader';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const ConfirmPacketSendModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(sendmagicPacketState);
  const loginData = useRecoilValue(loginState);
  const [isSending, setIsSending] = useState(false);

  const closeModal = () => {
    setModalState({ data: null, isOpen: false });
  };

  const sendPacketNow = () => {
    setIsSending(true);

    ApiService.get(`/api/v1/networkdevices/wake/${modalState.data._id}`, loginData?.token, navigate)
      .then(data => {
        makeToast("success", String(data?.message));
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Failed to send packet");
      }).finally(() => {
        setIsSending(false);
        setModalState({ data: null, isOpen: false });
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Wake Device"
      closeModal={isSending ? null : closeModal}
      body={
        isSending ?
          <div className="flex justify-center items-center h-full p-8">
            <NiceLoader className='text-loaderColor' />
          </div> : <p>Are you sure you want to wake this device?</p>
      }
      footer={
        !isSending && <>
          <NiceButton
            label='Cancel'
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label='Confirm'
            className="bg-buttonSuccess text-buttonText"
            onClick={sendPacketNow}
          />
        </>
      } />
  );
}

const MemoizedComponent = React.memo(ConfirmPacketSendModal);
export default MemoizedComponent;

