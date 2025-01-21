import React from "react";
import PropTypes from "prop-types";

const NiceTip = ({ title, children }) => {

    return (
        <div className="bg-niceTipBg rounded-md p-4 shadow-sm border border-2 border-niceTipBorder">
            {
                title && <div className="flex items-center gap-2 mb-2">
                    <span className="text-niceTipTitleColor font-medium">{title}</span>
                </div>
            }
            <div className="text-niceTipText">
                {children}
            </div>
        </div>
    )
}

NiceTip.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node
}

const MemoizedComponent = React.memo(NiceTip);
export default MemoizedComponent;