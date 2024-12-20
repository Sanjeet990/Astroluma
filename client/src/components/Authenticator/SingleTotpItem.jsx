import React, { useState } from 'react';
import ImageView from '../Misc/ImageView';
import { FiEdit, FiMove, FiTrash } from 'react-icons/fi';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NiceButton from '../NiceViews/NiceButton';
import PropTypes from 'prop-types';

const SingleTotpItem = (props) => {
    const navigate = useNavigate();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? "100" : "auto",
        opacity: isDragging ? 0.3 : 1
    };

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const handleDeleteClick = (e) => {
        e.preventDefault();
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = (e) => {
        e.preventDefault();
        handleDelete();
        setShowDeleteConfirmation(false);
    };

    const handleCancelDelete = (e) => {
        e.preventDefault();
        setShowDeleteConfirmation(false);
    };

    const handleDelete = () => {
        props.deleteTotpItem(props.item._id)
    }

    const doEdit = (e) => {
        e.preventDefault();
        navigate(`/manage/totp/save/${props.item._id}`)
    }

    return (
        <motion.div
            style={style}
            ref={setNodeRef}
            key={props.item._id}
            whileHover={{ scale: 1.03 }}
            className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText pt-10 pb-10 rounded-xl shadow-md h-80" >
            {showDeleteConfirmation ? (
                <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-center">Are you sure you want to delete this item?</p>
                    <div className='m-6 flex justify-center space-x-4'>
                        <NiceButton
                            label="Yes"
                            className="bg-buttonDanger text-buttonText"
                            onClick={handleConfirmDelete}
                        />
                        <NiceButton
                            label="No"
                            className="bg-buttonSuccess text-buttonText"
                            onClick={handleCancelDelete}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className='flex items-center justify-center p-8'>
                        <ImageView alt="Link" src={props.item.serviceIcon ? props.item.serviceIcon : "/computer.png"} defaultSrc="/computer.png" errorSrc="/computer.png" width="80px" />
                    </div>
                    <div className='flex items-center justify-center text-center overflow-hidden !min-h-20 !max-h-20'>{props.item.serviceName}<br />{props.item.accountName}</div>
                    <div
                        {...listeners}
                        {...attributes}
                        className="absolute top-0 left-0 p-2 cursor-move opacity-50 m-2 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                    >
                        <FiMove size={20} />
                    </div>
                </>
            )}
            {!showDeleteConfirmation && (
                <div
                    role="button"
                    onClick={handleDeleteClick}
                    className="absolute top-0 right-0 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ml-8 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                >
                    <FiTrash size={20} />
                </div>
            )}
            {!showDeleteConfirmation && (
                <div
                    role="button"
                    onClick={doEdit}
                    className="absolute top-0 right-8 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                >
                    <FiEdit size={20} />
                </div>
            )}
        </motion.div>
    );
};

SingleTotpItem.propTypes = {
    item: PropTypes.object.isRequired,
    deleteTotpItem: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
};

const MemoizedComponent = React.memo(SingleTotpItem);
export default MemoizedComponent;
