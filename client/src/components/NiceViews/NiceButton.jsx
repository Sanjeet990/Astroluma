import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const NiceButton = ({ label = "Go Back", onClick = null, disabled = false, className = "", parentClassname = "" }) => {
    return (
        <motion.div 
            className={`inline-flex ${parentClassname}`}
            initial={{ scale: 1 }}
            whileHover={{ 
                scale: 1.03,
                transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 10
                }
            }}
            whileTap={{ scale: 0.97 }}
        >
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={`
                    min-w-[100px]
                    cursor-${disabled ? "not-allowed" : "pointer"}
                    text-sm
                    py-2
                    px-4
                    rounded-full
                    m-1
                    text-xs
                    transition-all
                    duration-200
                    ${disabled ? "opacity-50" : ""}
                    ${className}
                `}
            >
                {label}
            </button>
        </motion.div>
    );
};

NiceButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    parentClassname: PropTypes.string
};

const MemoizedComponent = React.memo(NiceButton);
export default MemoizedComponent;