import React from 'react';
import { motion } from 'framer-motion';
import NiceLink from '../NiceViews/NiceLink';
import NiceButton from '../NiceViews/NiceButton';
import PropTypes from 'prop-types';

const SinglePageItem = ({ page, deletePage, managePublish }) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.05 * page.id }}
      className="border bg-cardBg text-cardText border-cardBorder shadow-md rounded-lg p-2 flex flex-col md:flex-row justify-between items-center w-full md:p-4"
    >
      <div className="flex space-x-2 mt-2 md:mt-0 mr-auto">
        <h2 className="text-sm md:text-base">{page.pageTitle}</h2>
      </div>
      <div className="flex space-x-2 mt-2 md:mt-0 ml-auto">
        <NiceLink
          label='Edit'
          className="bg-buttonSuccess text-buttonText"
          to={`/manage/page/${page.id}`}
        />
        <NiceButton
          label='Delete'
          className="bg-buttonDanger text-buttonText"
          onClick={() => deletePage(page.id)}
        />
        <NiceButton
          label={page.isPublished ? 'Unpublish' : 'Publish'}
          className='bg-buttonInfo text-buttonText'
          onClick={() => managePublish(page.id, page.isPublished)}
        />
      </div>
    </motion.div>
  );
};

SinglePageItem.displayName = 'SinglePageItem';

SinglePageItem.propTypes = {
  page: PropTypes.object.isRequired,
  deletePage: PropTypes.func.isRequired,
  managePublish: PropTypes.func.isRequired
};


const MemoizedComponent = React.memo(SinglePageItem);
export default MemoizedComponent;
