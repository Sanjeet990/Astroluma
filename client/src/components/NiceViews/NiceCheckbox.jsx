import React from "react";
import PropTypes from "prop-types";

const NiceCheckbox = ({ label = "", checked = false, onChange = null, disabled = false }) => {

    const timestamp = Date.now();
    let id = Math.random().toString(36).substring(7);

    if (label) {
        id = label.toLowerCase().replace(/\s+/g, '') + timestamp;
    } else {
        id = Math.random().toString(36).substring(7) + timestamp;
    }

    return (
        <div className="mb-2">
            <div className={`flex items-center ${disabled ? "cursor-not-allowed" : ""}`}>
                <input
                    className={`mr-2 leading-tight accent-buttonGeneric ${
                        disabled ? "opacity-50" : ""
                    }`}
                    id={id}
                    disabled={disabled}
                    checked={checked}
                    onChange={onChange}
                    type="checkbox"
                />
                {
                    label && <label className="text-sm" htmlFor={id}>
                        {label}
                    </label>
                }
            </div>
        </div>
    )
}

NiceCheckbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool
}

const MemoizedComponent = React.memo(NiceCheckbox);
export default MemoizedComponent;
