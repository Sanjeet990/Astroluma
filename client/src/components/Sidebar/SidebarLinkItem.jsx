import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SidebarLinkItem = React.memo(({ icon, text, to, active }) => {
  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {to.startsWith("http") ? (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm group relative flex items-center gap-2.5 py-2 px-4 font-medium duration-300 ease-in-out rounded-full ${active ? 'text-sidebarItemSelectedText bg-sidebarItemSelectedBg hover:text-sidebarItemSelectedHoverText hover:bg-sidebarItemSelectedHoverBg' : 'bg-sidebarItemUnSelectedBg hover:bg-sidebarItemHoverBg text-sidebarItemUnSelectedText hover:text-sidebarItemHoverText'
            }`}
        >
          {icon}
          {text}
        </a>
      ) : (
        <NavLink
          to={to}
          className={`text-sm group relative flex items-center gap-2.5 py-2 px-4 font-medium duration-300 ease-in-out rounded-full ${active ? 'text-sidebarItemSelectedText bg-sidebarItemSelectedBg hover:text-sidebarItemSelectedHoverText hover:bg-sidebarItemSelectedHoverBg' : 'bg-sidebarItemUnSelectedBg hover:bg-sidebarItemHoverBg text-sidebarItemUnSelectedText hover:text-sidebarItemHoverText'
            }`}
        >
          {icon}
          {text}
        </NavLink>
      )}
    </motion.li>
  );
});

SidebarLinkItem.displayName = 'SidebarLinkItem';

SidebarLinkItem.propTypes = {
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired
}

export default SidebarLinkItem;