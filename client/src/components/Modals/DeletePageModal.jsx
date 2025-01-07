import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { changedPageState, deletePageModalState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const DeletePageModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(deletePageModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);
  const setDeletedPage = useSetRecoilState(changedPageState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/page/delete/${modalState.data?.pageId}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Page deleted.");
        setDeletedPage(modalState.data?.pageId);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Page cannot be deleted.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirm"
      body={<p>Are you sure you want to delete this page?</p>}
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

const MemoizedComponent = React.memo(DeletePageModal);
export default MemoizedComponent;
