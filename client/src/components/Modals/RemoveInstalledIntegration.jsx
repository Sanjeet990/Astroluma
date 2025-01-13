import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { removeInstalledIntegrationModalState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';
import emitter, { RELOAD_INSTALLED_APPS } from '../../events';


const RemoveInstalledIntegration = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(removeInstalledIntegrationModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/app/${modalState.data?.app.appId}/delete`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", "Integration deleted.");
        //setDeletedSnippet(modalState.data?.snippetItem);
        emitter.emit(RELOAD_INSTALLED_APPS)
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Integration cannot be deleted.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Delete confirm"
      body={<p>Are you sure you want to delete this integration?</p>}
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

const MemoizedComponent = React.memo(RemoveInstalledIntegration);
export default MemoizedComponent;
