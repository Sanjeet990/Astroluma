import React from "react";
import PropTypes from "prop-types";

const NicePreferenceHeader = ({ title }) => {

    return (
        <div className="mt-4 mb-4">
            <div className="text-md text-breadcrumbLinkText font-bold">{title}</div>
        </div>
    )
}

NicePreferenceHeader.propTypes = {
    title: PropTypes.string
}

const MemoizedComponent = React.memo(NicePreferenceHeader);
export default MemoizedComponent;