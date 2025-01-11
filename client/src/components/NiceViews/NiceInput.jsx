import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const NiceInput = ({
    label = "",
    name = "",
    type = "text",
    value = "",
    onChange = null,
    placeholder,
    disabled = false,
    min = "",
    max = "",
    error = "",
    className = "" }) => {

    const [showPassword, setShowPassword] = useState(false);
    const timestamp = Date.now();
    let id = Math.random().toString(36).substring(7);

    if (label) {
        id = label.toLowerCase().replace(/\s+/g, '') + timestamp;
    } else {
        id = Math.random().toString(36).substring(7) + timestamp;
    }

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="mb-4">
            {
                label && <label className="block mb-2" htmlFor={id}>
                    {label}
                </label>
            }
            <div className="relative">
                <input
                    className={`${disabled ? "cursor-not-allowed" : ""} appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline placeholder-opacity-50 ${type === 'password' ? 'pr-10' : ''} ${className}`}
                    id={id}
                    type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                    value={value}
                    name={name || id}
                    onChange={onChange}
                    disabled={disabled}
                    min={min}
                    max={max}
                    placeholder={placeholder || `Enter ${label}`}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={togglePassword}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <FaEyeSlash size={20} />
                        ) : (
                            <FaEye size={20} />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

NiceInput.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    min: PropTypes.string,
    max: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string
};

const MemoizedComponent = React.memo(NiceInput);
export default MemoizedComponent;