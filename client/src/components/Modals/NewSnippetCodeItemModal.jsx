import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import { loginState, newSnippetCodeModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceModal from '../NiceViews/NiceModal';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import languagesList from '../../utils/LanguageList';
import { FiFileText } from 'react-icons/fi';
import emitter, { RELOAD_CODE_SNIPPET } from '../../events';

const NewSnippetCodeItemModal = () => {
  const navigate = useNavigate();
  const loginData = useRecoilValue(loginState);
  const [modalState, setModalState] = useRecoilState(newSnippetCodeModalState);
  
  const [snippetCode, setSnippetCode] = useState('');
  const [filename, setFileName] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedLanguageInfo, setSelectedLanguageInfo] = useState(null);

  useEffect(() => {
    if (modalState.data?.snippetItem) {
      setSnippetCode(modalState.data?.snippetItem.snippetCode || '');
      setFileName(modalState.data?.snippetItem.snippetFilename || '');
      setLanguage(modalState.data?.snippetItem.snippetLanguage || '');
      
      const lang = languagesList.find(lang => lang.languageValue === modalState.data?.snippetItem.snippetLanguage);
      setSelectedLanguageInfo(lang);
    } else {
      setSnippetCode('');
      setFileName('');
      setLanguage('');
      setSelectedLanguageInfo(null);
      setErrors({});
    }
  }, [modalState]);

  const validate = () => {
    const newErrors = {};
    if (!snippetCode.trim()) newErrors.code = 'Code snippet content is required';
    if (!language) newErrors.language = 'Please select a language';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeModal = () => {
    setModalState({ isOpen: false, data: {} });
    setErrors({});
  };

  const handleLanguageChange = (e) => {
    const selectedValue = e.target.value;
    setLanguage(selectedValue);
    
    if (selectedValue) {
      const lang = languagesList.find(lang => lang.languageValue === selectedValue);
      setSelectedLanguageInfo(lang);
      
      // Auto-suggest filename if not already set
      if (!filename && lang?.languageExtension) {
        setFileName(`snippet.${lang.languageExtension}`);
      }
    } else {
      setSelectedLanguageInfo(null);
    }
    
    if (errors.language) {
      setErrors({...errors, language: null});
    }
  };

  const createNewSnippetCodeItem = () => {
    if (!validate()) return;
    
    setLoading(true);

    const codeId = modalState.data?.snippetItem?.id;
    const newSnippetItem = {
      snippetCode,
      snippetFilename: filename || `snippet${selectedLanguageInfo?.languageExtension ? `.${selectedLanguageInfo.languageExtension}` : ''}`,
      language,
      codeId
    };

    ApiService.post(`/api/v1/snippet/save/${modalState.data?.snippetId}`, newSnippetItem, loginData?.token, navigate)
      .then(() => {
        makeToast("success", codeId ? 'Code snippet updated successfully' : 'Code snippet added successfully');
        setSnippetCode('');
        setFileName('');
        setLanguage('');
        emitter.emit(RELOAD_CODE_SNIPPET);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", 'Failed to save code snippet.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      title={modalState.data?.snippetItem ? "Edit Code Snippet" : "Add Code Snippet"}
      show={modalState.isOpen}
      closeModal={closeModal}
      icon={<FiFileText className="text-snippedIconColor" size={24} />}
      body={
        <>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="language">
              Language
            </label>
            <div className="relative">
              <select
                id="language"
                value={language}
                onChange={handleLanguageChange}
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
            {selectedLanguageInfo && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedLanguageInfo.languageName} - 
                {selectedLanguageInfo.languageExtension ? 
                  ` Files typically use .${selectedLanguageInfo.languageExtension} extension` : 
                  ' No specific file extension'}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="filename">
              File Name <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFileName(e.target.value)}
              className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder"
              placeholder={`Enter file name (e.g. example${selectedLanguageInfo?.languageExtension ? `.${selectedLanguageInfo.languageExtension}` : ''})`}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="snippetCode">
              Code Snippet
            </label>
            <textarea
              id="snippetCode"
              value={snippetCode}
              onChange={(e) => {
                setSnippetCode(e.target.value);
                if (errors.code) setErrors({...errors, code: null});
              }}
              rows={10}
              placeholder="Paste your code here"
              className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline font-mono bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder ${errors.code ? 'border-red-500' : ''}`}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
          </div>
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
            label={loading ? 'Saving...' : (modalState.data?.snippetItem ? 'Update' : 'Add')}
            className="bg-buttonSuccess text-buttonText"
            onClick={createNewSnippetCodeItem}
            disabled={loading}
          />
        </div>
      }
    />
  );
};

const MemoizedComponent = React.memo(NewSnippetCodeItemModal);
export default MemoizedComponent;
