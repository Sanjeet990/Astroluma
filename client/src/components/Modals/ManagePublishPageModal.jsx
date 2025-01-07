import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { changedPageState, loadingState, loginState, publishPageModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const ManagePublishPageModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(publishPageModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);
  const setDeletedPage = useSetRecoilState(changedPageState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const confirmDelete = () => {
    setLoading(true);

    ApiService.get(`/api/v1/page/action/${modalState.data?.pageId}/${modalState.data?.isPublished ? "unpublish" : "publish"}`, loginData?.token, navigate)
      .then(() => {
        makeToast("success", modalState.data?.isPublished ? "Page unpublished." : "Page published.");
        setDeletedPage(modalState.data?.pageId);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", modalState.data?.isPublished ? "Page can't be unpublished." : "Page can't be published.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      title={modalState.data?.isPublished ? "Unpublish confirm" : "Publish confirm"}
      show={modalState.isOpen}
      onClose={closeModal}
      body={
        <div>
          <p>Are you sure you want to {modalState.data?.isPublished ? "unpublish" : "publish"} this page?</p>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <NiceButton
            label='Cancel'
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label='Confirm'
            className={modalState.data?.isPublished ? 'bg-buttonWarning text-buttonText' : 'bg-buttonSuccess text-buttonText'}
            onClick={confirmDelete}
          />
        </div>
      }
    />
  );
}

const MemoizedComponent = React.memo(ManagePublishPageModal);
export default MemoizedComponent;

