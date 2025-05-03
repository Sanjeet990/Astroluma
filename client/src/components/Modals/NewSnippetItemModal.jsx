import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { loginState, newSnippetModalState, savedSnippetState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceModal from '../NiceViews/NiceModal';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import makeToast from '../../utils/ToastUtils';
import languagesList from '../../utils/LanguageList';
import { FiCode } from 'react-icons/fi';

const NewSnippetItemModal = () => {
  const navigate = useNavigate();
  const loginData = useRecoilValue(loginState);
  const [modalState, setModalState] = useRecoilState(newSnippetModalState);
  const savedSnippet = useSetRecoilState(savedSnippetState);
  
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCode, setSnippetCode] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (modalState.data?.snippetItem) {
      setSnippetTitle(modalState.data?.snippetItem.snippetTitle);
      setLanguage(modalState.data?.snippetItem.snippetLanguage);
    } else {
      setSnippetTitle('');
      setSnippetCode('');
      setLanguage('');
      setErrors({});
    }
  }, [modalState]);

  const validate = () => {
    const newErrors = {};
    if (!snippetTitle.trim()) newErrors.title = 'Snippet title is required';
    if (!language) newErrors.language = 'Please select a language';
    if (!modalState.data?.snippetItem && !snippetCode.trim()) newErrors.code = 'Code snippet is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeModal = () => {
    setModalState({ isOpen: false, data: {} });
    setErrors({});
  };

  const createNewSnippetItem = () => {
    if (!validate()) return;
    
    setLoading(true);

    const newSnippetItem = {
      listingId: modalState.data?.listingId,
      snippetId: modalState.data?.snippetItem ? modalState.data?.snippetItem.id : null,
      snippetCode: modalState.data?.snippetItem ? null : snippetCode,
      snippetTitle,
      language
    };

    ApiService.post('/api/v1/snippet/item', newSnippetItem, loginData?.token, navigate)
      .then(data => {
        makeToast("success", modalState.data?.snippetItem ? 'Snippet updated successfully' : 'Snippet created successfully');
        setSnippetCode('');
        setSnippetTitle('');
        setLanguage('');
        savedSnippet({ snippet: data.message, action: modalState.data?.snippetItem ? 'edit' : 'add' });
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", 'Failed to save snippet.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      title={modalState.data?.snippetItem ? "Edit Snippet" : "New Snippet"}
      show={modalState.isOpen}
      closeModal={closeModal}
      icon={<FiCode className="text-snippedIconColor" size={24} />}
      body={
        <>
          <div className="mb-4">
            <NiceInput
              label="Snippet Title"
              value={snippetTitle}
              className={`border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder ${errors.title ? 'border-red-500' : ''}`}
              onChange={(e) => {
                setSnippetTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: null});
              }}
              placeholder="Enter a descriptive title for your snippet"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-snippetCardText" htmlFor="language">
              Language
            </label>
            <div className="relative">
              <select
                id="language"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  if (errors.language) setErrors({...errors, language: null});
                }}
                className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText ${errors.language ? 'border-red-500' : ''}`}
              >
                <option value="">Select language</option>
                {languagesList.map((lang, index) => (
                  <option key={index} value={lang.languageValue}>{lang.languageName}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
          </div>

          {!modalState.data?.snippetItem && 
            <div className="mb-4">
              <label className="block mb-2 text-snippetCardText" htmlFor="snippetName">
                Initial Code Snippet
              </label>
              <textarea
                id="snippetName"
                value={snippetCode}
                rows={5}
                onChange={(e) => {
                  setSnippetCode(e.target.value);
                  if (errors.code) setErrors({...errors, code: null});
                }}
                placeholder="Paste your initial code snippet here"
                className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline font-mono bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder ${errors.code ? 'border-red-500' : ''}`}
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              <p className="text-xs text-gray-500 mt-1">You can add more code snippets after creating this snippet.</p>
            </div>
          }
        </>
      }
      footer={
        <div className="flex justify-end space-x-2">
          <NiceButton
            label='Cancel'
            className="bg-buttonGeneric text-buttonText"
            onClick={closeModal}
            disabled={loading}
          />
          <NiceButton
            label={loading ? 'Saving...' : (modalState.data?.snippetItem ? 'Update' : 'Create')}
            className="bg-buttonSuccess text-buttonText"
            onClick={createNewSnippetItem}
            disabled={loading}
          />
        </div>
      }
    />
  );
}

const MemoizedComponent = React.memo(NewSnippetItemModal);
export default MemoizedComponent;

