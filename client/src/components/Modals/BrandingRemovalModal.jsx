import React from 'react';
import { useRecoilState } from 'recoil';
import { removeBrandingModalState } from '../../atoms';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import { BiCoffee } from 'react-icons/bi';
import { AiOutlineHeart } from 'react-icons/ai';
import { CONSTANTS } from '../../utils/Constants';

const BrandingRemovalModal = () => {

  const [modalState, setModalState] = useRecoilState(removeBrandingModalState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const doDonate = () => {
    window.open(CONSTANTS.BuyMeACoffee, '_blank');
  };

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
              If you&#39;re finding this tool valuable, consider supporting its development.
              Your contribution helps maintain and improve the project.
            </p>
            <p className="text-center">
              While you can remove branding for free, your donation would help us
              continue building great tools for everyone.
            </p>
            <p className="text-sm text-modalBodyText/50 text-center italic">
              Note: Branding removal is available for free - supporting us is entirely optional!
            </p>
          </div>
        </div>
      }
      footer={
        <div className='w-full text-center'>
          <NiceButton
            label="No, Thanks"
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label="Support Us"
            className="bg-buttonSuccess text-buttonText"
            onClick={doDonate}
          />
        </div>
      }
    />
  );
}

const MemoizedComponent = React.memo(BrandingRemovalModal);
export default MemoizedComponent;