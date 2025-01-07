import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { deleteIntegrationModalState, deletedIntegrationState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const DeleteIntegrationModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(deleteIntegrationModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);
  const setDeletedIntegration = useSetRecoilState(deletedIntegrationState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/app/remove/${modalState.data?._id}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Integration removed successfully.");
        setDeletedIntegration(modalState.data);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Cannot remove integration. Please try later.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirm"
      body={<p>Are you sure you want to remove this integration? This is a permanent action and cannot be undone.</p>}
      footer={
        <>
          <NiceButton
            label='Cancel'
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label='Remove'
            className="bg-buttonWarning text-buttonText"
            onClick={confirmDelete}
          />
        </>
      } />
  );
}

const MemoizedComponent = React.memo(DeleteIntegrationModal);
export default MemoizedComponent;
