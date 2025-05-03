import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { loginState, newDeleteCodeModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceModal from '../NiceViews/NiceModal';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import emitter, { RELOAD_CODE_SNIPPET } from '../../events';
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteCodeItemModal = () => {
    const navigate = useNavigate();
    const loginData = useRecoilValue(loginState);
    const [modalState, setModalState] = useRecoilState(newDeleteCodeModalState);
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (modalState.isOpen) {
            setConfirmText('');
        }
    }, [modalState.isOpen]);

    const closeModal = () => {
        setModalState({ isOpen: false, data: {} });
    };

    const deleteCodeItem = () => {
        setLoading(true);
        const snippetId = modalState?.data?.snippetId;
        const codeId = modalState?.data?.snippetItem?.id;

        ApiService.get(`/api/v1/snippet/${snippetId}/delete/${codeId}`, loginData?.token, navigate)
            .then(() => {
                makeToast("success", "Code snippet deleted successfully.");
                emitter.emit(RELOAD_CODE_SNIPPET);
                closeModal();
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Failed to delete code snippet.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Extract file name for display
    const fileName = modalState?.data?.snippetItem?.snippetFilename || "this code snippet";
    
    // Check if delete button should be enabled
    const isDeleteEnabled = confirmText.toLowerCase() === 'delete';

    return (
        <NiceModal
            title="Delete Code Snippet"
            show={modalState.isOpen}
            closeModal={closeModal}
            icon={<FiAlertTriangle className="text-red-500" size={24} />}
            body={
                <>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FiAlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    You are about to delete <span className="font-semibold">{fileName}</span>. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <p className="mb-4">This will permanently delete the code snippet from your collection. The snippet content cannot be recovered.</p>
                    
                    <div className="mb-4">
                        <label htmlFor="confirmText" className="block mb-2 text-sm font-medium">
                            Type <span className="font-semibold">delete</span> to confirm:
                        </label>
                        <input
                            type="text"
                            id="confirmText"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                            placeholder="delete"
                        />
                    </div>
                </>
            }
            footer={
                <div className="flex justify-end space-x-2">
                    <NiceButton
                        label="Cancel"
                        className="bg-buttonGeneric text-buttonText"
                        onClick={closeModal}
                        disabled={loading}
                    />
                    <NiceButton
                        label={loading ? "Deleting..." : "Delete"}
                        className={`${isDeleteEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'} text-white`}
                        onClick={deleteCodeItem}
                        disabled={!isDeleteEnabled || loading}
                    />
                </div>
            }
        />
    );
};

const MemoizedComponent = React.memo(DeleteCodeItemModal);
export default MemoizedComponent;

