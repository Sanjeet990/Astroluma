import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, newSnippetModalState, savedSnippetState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import languagesList from '../../utils/LanguageList';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const NewSnippetItemModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(newSnippetModalState);
  const loginData = useRecoilValue(loginState);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCode, setSnippetCode] = useState('');
  const [language, setLanguage] = useState("");
  const setLoading = useSetRecoilState(loadingState);
  const savedSnippet = useSetRecoilState(savedSnippetState);

  useEffect(() => {
    if (modalState.data?.snippetItem) {
      setSnippetTitle(modalState.data?.snippetItem.snippetTitle);
      setLanguage(modalState.data?.snippetItem.snippetLanguage);
    } else {
      setSnippetTitle('');
      setSnippetCode('');
      setLanguage("");
    }
  }, [modalState]);


  const closeModal = () => {
    setModalState({ isOpen: false, data: {} });
  };

  const createNewSnippetItem = () => {
    if (!snippetTitle) {
      makeToast("warning", 'Please enter snippet title.');
      return;
    }

    if (!language) {
      makeToast("warning", 'Please select the language.');
      return;
    }

    setLoading(true);

    const newSnippetItem = {
      listingId: modalState.data?.listingId,
      snippetId: modalState.data?.snippetItem ? modalState.data?.snippetItem._id : null,
      snippetCode: modalState.data?.snippetItem ? null : snippetCode,
      snippetTitle,
      language
    };

    ApiService.post('/api/v1/snippet/item', newSnippetItem, loginData?.token, navigate)
      .then(data => {
        makeToast("success", 'Snippet item saved.');
        setSnippetCode('');
        setSnippetTitle('');
        setLanguage('');
        savedSnippet({ snippet: data.message, action: modalState.data?.snippetItem ? 'edit' : 'add' });
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", 'Can not save snippet item.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      title={modalState.data?.snippetItem ? "Edit Snippet Item" : "New Snippet Item"}
      show={modalState.isOpen}
      closeModal={closeModal}
      body={
        <>
          <NiceInput
            label="Snippet Title"
            value={snippetTitle}
            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
            onChange={(e) => setSnippetTitle(e.target.value)}
            placeholder="Enter snippet title"
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

          {
            !modalState.data?.snippetItem && <div className="mb-4">
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
          }
        </>
      }
      footer={
        <NiceButton
          label='Save'
          className="bg-buttonSuccess text-buttonText"
          onClick={createNewSnippetItem}
        />
      }
    />
  );

}

const MemoizedComponent = React.memo(NewSnippetItemModal);
export default MemoizedComponent;

