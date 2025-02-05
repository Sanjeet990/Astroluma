import React from 'react';
import PropTypes from 'prop-types';

const SidebarItemHeader = React.memo(({ title }) => {
  return (
    <h3 className="mb-3 ml-4 text-sm text-sidebarHeaderItemText font-bold">{title}</h3>
  );
});

SidebarItemHeader.displayName = 'SidebarItemHeader';

SidebarItemHeader.propTypes = {
  title: PropTypes.string
};

export default SidebarItemHeader;