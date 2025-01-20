import React, { useEffect, useMemo, useState } from 'react';
import NiceInput from '../NiceViews/NiceInput';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceButton from '../NiceViews/NiceButton';
import JoditEditor from 'jodit-react';
import '../Page/Jodit.css';
import { useRecoilValue } from 'recoil';
import { colorThemeState } from '../../atoms';
import SystemThemes from '../../utils/SystemThemes';
import PropTypes from 'prop-types';

const AppConfigurator = ({ application, config, appConfigurationListener, connectionStatus, testConnectionListener }) => {
    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        appConfigurationListener({ ...config, [name]: type === 'checkbox' ? checked : value });
    };

    const handleHtmlChange = (name, value) => {
        appConfigurationListener({ ...config, [name]: value });
    };

    const joditConfig = useMemo(() => ({
        readonly: false,
        theme: themeType,
        placeholder: ''
    }), [themeType]);

    if (!application) return null;

    return (
        <div className="w-full mt-4">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4" id='appConfigurator' name='appConfigurator'>
                {application?.config?.map((field, index) => (
                    <div key={index} className={`${field.type === 'html' ? 'col-span-1 md:col-span-2' : ''} ${field.type === 'checkbox' || field.type === 'radio' ? 'flex items-center' : ''}`}>
                        {field.type === 'select' ? (
                            <>
                                <label className="block mb-1 md:mb-2" htmlFor={field.name}>{`${field.label} ${field.required ? '*' : ''}`}</label>
                                <select
                                    id={field.name}
                                    name={field.name}
                                    className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-inputBg border-inputBorder text-inputText"
                                    value={config[field.name] || ''}
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
                            <div className="flex items-center">
                                <NiceCheckbox
                                    label={field.label}
                                    name={field.name}
                                    checked={config[field.name] || false}
                                    onChange={handleChange}
                                />
                            </div>
                        ) : field.type === 'radio' ? (
                            <div className="w-full">
                                <label className="block mb-1 md:mb-2">{`${field.label} ${field.required ? '*' : ''}`}</label>
                                {field.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center mb-1 md:mb-2">
                                        <input
                                            type="radio"
                                            id={`${field.name}-${optionIndex}`}
                                            name={field.name}
                                            value={option}
                                            checked={config[field.name] === option}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label className="ml-2 text-inputText" htmlFor={`${field.name}-${optionIndex}`}>
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : field.type === 'html' ? (
                            <div className="w-full mb-4">
                                <label className="block mb-2" htmlFor={field.name}>
                                    {field.label}
                                </label>
                                <JoditEditor
                                    style={{ height: '300px' }}
                                    value={config[field.name] || ''}
                                    config={joditConfig}
                                    onChange={newContent => handleHtmlChange(field.name, newContent)}
                                />
                            </div>
                        ) : (
                            <NiceInput
                                label={`${field.label} ${field.required ? '*' : ''}`}
                                name={field.name}
                                value={config[field.name] || ''}
                                className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder mb-0'
                                onChange={handleChange}
                                type={field.type}
                                placeholder={field.placeholder}
                            />
                        )}
                    </div>
                ))}
            </form>
            {connectionStatus && (
                <div className={`mt-6 break-words text-sm border p-2 rounded-lg max-h-72 overflow-y-auto ${connectionStatus.status === 'success' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`} role="alert">
                    {connectionStatus.message}
                </div>
            )}
            <div className="flex justify-end space-x-4 mt-4 md:mt-6">
                <NiceButton
                    label="Test Connection"
                    onClick={testConnectionListener}
                    className="bg-buttonSuccess text-buttonText"
                />
            </div>
        </div>
    );
};

AppConfigurator.propTypes = {
    application: PropTypes.object,
    config: PropTypes.object,
    appConfigurationListener: PropTypes.func,
    connectionStatus: PropTypes.object,
    testConnectionListener: PropTypes.func
};

const MemoizedComponent = React.memo(AppConfigurator);
export default MemoizedComponent;