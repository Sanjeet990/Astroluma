import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { deletedTodoState, loadingState, loginState, newDeleteModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const DeleteTodoModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(newDeleteModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);
  const setDeletedTodo = useSetRecoilState(deletedTodoState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/todo/${modalState.data?.listingId}/delete/${modalState.data?.todoItem?._id}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Todo item deleted.");
        setDeletedTodo(modalState.data?.todoItem);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Todo item cannot be deleted.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirm"
      body={<p>Are you sure you want to delete this todo item?</p>}
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

const MemoizedComponent = React.memo(DeleteTodoModal);
export default MemoizedComponent;
