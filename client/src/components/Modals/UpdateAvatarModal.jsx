import React, { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { imageModalState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const UpdateAvatarModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(imageModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);

  const [password, setPassword] = useState();
  const [repeatPassword, setRepeatPassword] = useState();

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const changePassword = () => {

    if (!password || !repeatPassword) {
      makeToast("warning", "Password and Repeat Password are required.");
      return;
    }

    if (password !== repeatPassword) {
      makeToast("warning", "Password and Repeat Password do not match.");
      return;
    }

    setLoading(true);

    ApiService.post(`/api/v1/accounts/password/${modalState.data?.userId}`, { password }, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Password changed.");
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Password can not be changed.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Change Avatar"
      body={
        <>
          <NiceInput
            label='Password'
            type='password'
            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <NiceInput
            label='Repeat Password'
            type='password'
            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </>
      }
      footer={
        <>
          <NiceButton
            label='Cancel'
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label='Change'
            className="bg-buttonSuccess text-buttonText"
            onClick={changePassword}
          />
        </>
      }
      closeModal={closeModal}
    />
  )

}

const MemoizedComponent = React.memo(UpdateAvatarModal);
export default MemoizedComponent;

