import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, reloadDashboardDataState, removeBrandingModalState } from '../../atoms';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import { BiCoffee } from 'react-icons/bi';
import { AiOutlineHeart } from 'react-icons/ai';
import { CONSTANTS } from '../../utils/Constants';
import makeToast from '../../utils/ToastUtils';
import ApiService from '../../utils/ApiService';
import { useNavigate } from 'react-router-dom';

const BrandingRemovalModal = () => {

  const navigate = useNavigate();
  const [modalState, setModalState] = useRecoilState(removeBrandingModalState);
  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);
  const setReloadData = useSetRecoilState(reloadDashboardDataState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const doDonate = () => {
    window.open(CONSTANTS.BuyMeACoffee, '_blank');
  };

  const doRemoveBranding = (donating) => {
    setLoading(true);
    ApiService.get("/api/v1/accounts/debrand", loginData?.token, navigate)
      .then(() => {
        setReloadData(true);
        makeToast("success", "Astroluma branding removed successfully.");
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Error removing branding.");
      }).finally(() => {
        setLoading(false);
        closeModal();
        if (donating) {
          doDonate();
        }
      });
  }

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Support Our Project"
      body={
        <div className="space-y-6 p-6">
          <div className="flex justify-center items-center gap-4">
            <BiCoffee className="h-12 w-12 text-amber-600" />
            <AiOutlineHeart className="h-10 w-10 text-rose-500" />
          </div>
          <h3 className="text-xl font-semibold text-center">Help Us Keep Creating</h3>
          <div className="space-y-4">
            <p className="text-center">
              Your support keeps this tool alive and thriving! Every contribution helps us maintain and improve the project.
            </p>
            <p className="text-center">
              Plus, as a token of appreciation, contributors will be featured on the Astroluma portal, showcasing their invaluable support to our community.
            </p>
            <p className="text-sm text-modalBodyText/50 text-center italic">
              Branding removal is complimentary, but your support ensures we can continue building great tools for everyone. Thank you for helping us grow!
            </p>
          </div>
        </div>
      }
      footer={
        <div className='w-full text-center'>
          <NiceButton
            label="No, Thanks"
            className="bg-buttonDanger text-buttonText"
            onClick={() => doRemoveBranding(false)}
          />
          <NiceButton
            label="Support Us"
            className="bg-buttonSuccess text-buttonText"
            onClick={() => doRemoveBranding(true)}
          />
        </div>
      }
    />
  );
}

const MemoizedComponent = React.memo(BrandingRemovalModal);
export default MemoizedComponent;