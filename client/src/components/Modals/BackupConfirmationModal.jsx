import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, backupConfirmationModalState } from '../../atoms';
import NiceButton from '../NiceViews/NiceButton';
import NiceModal from '../NiceViews/NiceModal';
import { MdBackup, MdWarning } from 'react-icons/md';
import { RiShieldKeyholeLine } from 'react-icons/ri';
import makeToast from '../../utils/ToastUtils';
import ApiService from '../../utils/ApiService';
import { useNavigate } from 'react-router-dom';

const BackupConfirmationModal = () => {
  const navigate = useNavigate();
  const [modalState, setModalState] = useRecoilState(backupConfirmationModalState);
  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleBackup = () => {
    setLoading(true);
    
    // Use the ApiService to get the backup data
    ApiService.get('/api/v1/settings/backup', loginData?.token, navigate)
      .then(data => {
        // Get the actual backup data from the response
        const backupData = data.message;
        
        // Create a JSON string with pretty formatting
        const jsonString = JSON.stringify(backupData, null, 2);
        
        // Create a blob from the JSON string
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = 'astroluma-backup.json';
        
        // Append the link to the body, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Release the blob URL
        URL.revokeObjectURL(url);
        
        makeToast("success", "Backup file created successfully");
      })
      .catch(error => {
        console.error('Backup failed:', error);
        makeToast("error", "Failed to generate backup");
      })
      .finally(() => {
        setLoading(false);
        closeModal();
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title="Backup Confirmation"
      closeModal={closeModal}
      body={
        <div className="space-y-6 p-6">
          <div className="flex justify-center items-center gap-4">
            <MdBackup className="h-12 w-12 text-blue-500" />
            <RiShieldKeyholeLine className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <MdWarning className="text-amber-500" />
            Security Warning
          </h3>
          <div className="space-y-4">
            <p className="text-center font-medium">
              The backup file contains sensitive data including secrets and credentials.
            </p>
            <div className="bg-modalInputBg border border-modalInputBorder rounded-md p-4 space-y-2">
              <p className="text-sm">
                <strong>Please note:</strong>
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Handle this backup file with care and store it securely</li>
                <li>Do not share this file with anyone</li>
                <li>Do not upload it to public repositories</li>
                <li>This backup is intended for migration to newer Astroluma versions</li>
              </ul>
            </div>
            <p className="text-sm text-modalBodyText/70 text-center italic">
              This file contains all your configurations, including sensitive credentials.
              Protect it as you would protect your passwords.
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between w-full">
          <NiceButton
            label="Cancel"
            className="bg-buttonDanger text-buttonText"
            onClick={closeModal}
          />
          <NiceButton
            label="Create Backup"
            className="bg-buttonSuccess text-buttonText"
            onClick={handleBackup}
          />
        </div>
      }
    />
  );
}

const MemoizedComponent = React.memo(BackupConfirmationModal);
export default MemoizedComponent;