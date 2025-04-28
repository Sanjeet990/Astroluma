import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { deletedImageState, deleteImageModalState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const DeleteImageModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(deleteImageModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);
  const setDeletedImage = useSetRecoilState(deletedImageState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/image/delete/${modalState.data?.imageId}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Image deleted successfully.");
        setDeletedImage(modalState.data?.imageId);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Image cannot be deleted.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirmation"
      body={<p>Are you sure you want to delete this image?</p>}
      footer={
        <>
          <NiceButton
            label='Cancel'
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label='Delete'
            className="bg-buttonWarning text-buttonText"
            onClick={confirmDelete}
          />
        </>
      } />
  );
}

const MemoizedComponent = React.memo(DeleteImageModal);
export default MemoizedComponent;