import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, newDeleteCodeModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import emitter, { RELOAD_CODE_SNIPPET } from '../../events';
import { useNavigate } from 'react-router-dom';

const DeleteCodeItemModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(newDeleteCodeModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/snippet/${modalState.data?.snippetId}/delete/${modalState.data?.snippetItem?._id}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Code item deleted.");
        emitter.emit(RELOAD_CODE_SNIPPET);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Code item cannot be deleted.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirm"
      body={<p>Are you sure you want to delete this code item?</p>}
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


const MemoizedComponent = React.memo(DeleteCodeItemModal);
export default MemoizedComponent;

