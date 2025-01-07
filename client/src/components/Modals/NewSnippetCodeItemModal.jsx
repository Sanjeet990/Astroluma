import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, newSnippetCodeModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import languagesList from '../../utils/LanguageList';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import emitter, { RELOAD_CODE_SNIPPET } from '../../events';
import { useNavigate } from 'react-router-dom';

const NewSnippetCodeItemModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(newSnippetCodeModalState);
  const loginData = useRecoilValue(loginState);
  const [filename, setFileName] = useState('');
  const [snippetCode, setSnippetCode] = useState('');
  const [language, setLanguage] = useState("");
  const [codeId, setCodeId] = useState(null);
  const setLoading = useSetRecoilState(loadingState);

  useEffect(() => {
    if (modalState.data?.snippetItem) {
      setCodeId(modalState.data?.snippetItem._id);
      setFileName(modalState.data?.snippetItem.snippetFilename);
      setSnippetCode(modalState.data?.snippetItem.snippetCode);
      setLanguage(modalState.data?.snippetItem.snippetLanguage);
    } else {
      setFileName('');
      setSnippetCode('');
      setLanguage("");
    }
  }, [modalState]);

  const closeModal = () => {
    setModalState({ isOpen: false, data: {} });
  };

  const createNewSnippetItem = () => {

    if (!language) {
      makeToast("warning", 'Please select the language.');
      return;
    }

    setLoading(true);

    const newSnippetItem = {
      codeId,
      snippetCode,
      snippetFilename: filename,
      language
    };

    ApiService.post(`/api/v1/snippet/save/${modalState.data?.snippetId}`, newSnippetItem, loginData?.token, navigate)
      .then(() => {
        makeToast("success", 'Code snippet added.');
        setSnippetCode('');
        setFileName('');
        setLanguage('');
        emitter.emit(RELOAD_CODE_SNIPPET);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", 'Can not add code snippet.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      title={modalState.data?.snippetItem ? "Edit Code Snippet" : "New Code Snippet"}
      show={modalState.isOpen}
      closeModal={closeModal}
      body={
        <>
          <NiceInput
            label='File Name'
            value={filename}
            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
            onChange={(e) => setFileName(e.target.value)}
            placeholder='Enter file name'
          />

          <div className="mb-4">
            <label className="block mb-2" htmlFor="language">
              Language
            </label>
            <select
              className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">Select language</option>
              {
                languagesList?.map((lang, index) => (
                  <option key={index} value={lang.languageValue}>{lang.languageName}</option>
                ))
              }
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="snippetName">
              Code Snippet
            </label>
            <textarea
              className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder"
              id="snippetName"
              value={snippetCode}
              rows={4}
              onChange={(e) => setSnippetCode(e.target.value)}
              placeholder="Enter code snippet"
            />
          </div>
        </>
      }
      footer={
        <NiceButton
          label='Save'
          className="bg-buttonSuccess text-buttonText"
          onClick={createNewSnippetItem}
        />
      } />
  );
}

const MemoizedComponent = React.memo(NewSnippetCodeItemModal);
export default MemoizedComponent;
