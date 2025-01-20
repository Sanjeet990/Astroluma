import React, { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { integrationConfigureModalState, loadingState, loginState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { useNavigate } from 'react-router-dom';
import NiceButton from '../NiceViews/NiceButton';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';

const AdditionalIntegrationConfigurationModal = () => {
  const [modalState, setModalState] = useRecoilState(integrationConfigureModalState);
  const loginData = useRecoilValue(loginState);
  const setLoading = useSetRecoilState(loadingState);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log('modalState', modalState);
    if (modalState.isOpen) {
      const initialFormData = {};
      if (modalState.data?.config) {
        modalState.data.config.forEach(field => {
          if (field.type === 'checkbox') {
            initialFormData[field.name] = false;
          } else if (field.type === 'radio') {
            initialFormData[field.name] = '';
          } else if (field.type === 'select') {
            initialFormData[field.name] = field.options[0] || '';
          } else {
            initialFormData[field.name] = '';
          }
        });
      }
      setFormData(initialFormData);
      setErrors({});
    }
  }, [modalState]);

  const closeModal = (installed) => {
    setModalState({ ...modalState, isOpen: false });
    if (installed) navigate('/manage/apps');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.integrationName) {
      newErrors.integrationName = 'Integration Name is required';
    }

    modalState.data?.config.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    return newErrors;
  };

  const confirmFormSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const configData = {};
    modalState.data?.config.forEach(field => {
      if (field.name !== 'integrationName') {
        configData[field.name] = formData[field.name];
      }
    });

    const requestData = {
      integrationName: formData.integrationName,
      appId: modalState.data.appId,
      config: configData,
    };

    ApiService.post("/api/v1/app/install", requestData, loginData?.token)
      .then(() => {
        makeToast("success", "Integration activated.");
        closeModal(true);
      })
      .catch(() => {
        makeToast("error", "Integration cannot be activated.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      title={`Add Integration: ${modalState.data?.appName}`}
      show={modalState.isOpen}
      body={
        <>
          <NiceInput
            label='Integration Name'
            name='integrationName'
            className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
            value={formData.integrationName}
            onChange={handleChange}
            error={errors.integrationName}
          />

          {
            modalState.data?.config?.map((field, index) => (
              <div key={index} className="mb-4">
                <div className={`${field.type === 'checkbox' || field.type === 'radio' ? 'flex items-center' : ''}`}>
                  {field.type === 'select' ? (
                    <>
                      <label className="block mb-2" htmlFor={field.name}>
                        {field.label}
                      </label>
                      <select
                        id={field.name}
                        name={field.name}
                        className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                      >
                        {field.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : field.type === 'checkbox' ? (
                    <NiceCheckbox
                      label={field.label}
                      name={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleChange}
                      error={errors[field.name]}
                    />
                  ) : field.type === 'radio' ? (
                    field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`${field.name}-${optionIndex}`}
                          name={field.name}
                          value={option}
                          checked={formData[field.name] === option}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label className="ml-2 text-inputText" htmlFor={`${field.name}-${optionIndex}`}>
                          {option}
                        </label>
                      </div>
                    ))
                  ) : (
                    <NiceInput
                      label={field.label}
                      name={field.name}
                      value={formData[field.name] || ''}
                      className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                      onChange={handleChange}
                      type={field.type}
                      placeholder={field.placeholder}
                    />
                  )}
                  {errors[field.name] && <p className="text-red-500 text-sm">{errors[field.name]}</p>}
                </div>
              </div>
            ))
          }

        </>
      }
      footer={
        <>
          <NiceButton
            label='Cancel'
            className="bg-buttonDanger text-buttonText"
            onClick={() => closeModal(false)}
          />
          <NiceButton
            label='Confirm'
            className="bg-buttonSuccess text-buttonText"
            onClick={confirmFormSubmit}
          />
        </>
      } />
  );

}

const MemoizedComponent = React.memo(AdditionalIntegrationConfigurationModal);
export default MemoizedComponent;
