import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { deletedSnippetState, deleteSnippetModalState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const DeleteSnippetItemModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(deleteSnippetModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);
  const setDeletedSnippet = useSetRecoilState(deletedSnippetState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/snippet/${modalState.data?.snippetItem._id}/delete`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Snippet deleted.");
        setDeletedSnippet(modalState.data?.snippetItem);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Snippet cannot be deleted.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirm"
      body={<p>Are you sure you want to delete this snippet?</p>}
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

const MemoizedComponent = React.memo(DeleteSnippetItemModal);
export default MemoizedComponent;
