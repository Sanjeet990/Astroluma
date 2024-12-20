import React from "react";
import PropTypes from "prop-types";

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

    const timestamp = Date.now();
    let id = Math.random().toString(36).substring(7);

    if (label) {
        id = label.toLowerCase().replace(/\s+/g, '') + timestamp;
    } else {
        id = Math.random().toString(36).substring(7) + timestamp;
    }

    return (
        <div className="mb-4">
            {
                label && <label className="block mb-2" htmlFor={id}>
                    {label}
                </label>
            }
            <input
                className={`${disabled ? "cursor-not-allowed" : ""} appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${className}`}
                id={id}
                type={type}
                value={value}
                name={name || id}
                onChange={onChange}
                disabled={disabled}
                min={min}
                max={max}
                placeholder={placeholder || `Enter ${label}`}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
}

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
}

const MemoizedComponent = React.memo(NiceInput);
export default MemoizedComponent;