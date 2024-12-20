import React, { useState } from 'react';
import ImageView from '../Misc/ImageView';
import { FiEdit, FiMove, FiTrash } from 'react-icons/fi';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link, useNavigate } from 'react-router-dom';
import { TbHandMove } from "react-icons/tb";
import { useRecoilState } from 'recoil';
import { moveItemState } from '../../atoms';
import { motion } from 'framer-motion';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import PropTypes from 'prop-types';

const SingleListing = (props) => {
    const navigate = useNavigate();

    const [moveItem, setMoveItem] = useRecoilState(moveItemState);

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
        props.deleteListing(props.item._id)
    }

    const decideLink = (edit) => {
        if (props.item.listingType === "category") {
            if (edit) return `/manage/listing/save/folder/${props.item._id}`;
            else return `/manage/listing/${props.item._id}`;
        } else if (props.item.listingType === "todo") {
            return `/manage/listing/save/todo/${props.item._id}`;
        } else if (props.item.listingType === "stream") {
            return `/manage/listing/save/stream/${props.item._id}`;
        } else if (props.item.listingType === "snippet") {
            return `/manage/listing/save/snippet/${props.item._id}`;
        } else {
            return `/manage/listing/save/link/${props.item._id}`;
        }
    }

    const doEdit = (e) => {
        e.preventDefault();
        navigate(decideLink(true))
    }

    const doMove = (e) => {
        e.preventDefault();
        if (moveItem?._id === props.item._id) {
            setMoveItem(null);
        } else {
            setMoveItem(props.item);
            makeToast("info", "Select a folder to move this item to.");
        }
    }

    const getDefaultIcon = () => {
        const type = props.item.listingType;
        if (type === "category") {
            return "/folder.png";
        }
        if (type === "todo") {
            return "/todo.png";
        }
        if (type === "stream") {
            return "/cctv.png";
        }
        return "/link.png";
    }

    return (
        <Link
            style={style}
            ref={setNodeRef}
            key={props.item._id}
            to={showDeleteConfirmation ? null : moveItem?.id === props.item._id ? null : decideLink(false)}
            className="relative"
        >
            <motion.div whileHover={{ scale: 1.03 }} className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText pt-10 pb-10 rounded-xl shadow-md h-80" style={{ overflow: 'hidden' }} >
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
                            <ImageView alt="Link" src={props.item.listingIcon ? props.item.listingIcon : getDefaultIcon()} defaultSrc={getDefaultIcon()} errorSrc={getDefaultIcon()} height="80px" width="80px" />
                        </div>
                        <div className='flex items-center justify-center text-center overflow-hidden !min-h-20 !max-h-20'>{props.item.listingName}</div>
                        <div
                            title="Reorder"
                            {...listeners}
                            {...attributes}
                            style={{ touchAction: "none" }}
                            className="absolute top-0 left-0 p-2 cursor-move opacity-50 m-2 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                        >
                            <FiMove size={20} />
                        </div>
                    </>
                )}
                {!showDeleteConfirmation && (
                    <div
                        title="Delete"
                        role="button"
                        onClick={handleDeleteClick}
                        className="absolute top-0 right-0 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ml-8 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                    >
                        <FiTrash size={20} />
                    </div>
                )}
                {!showDeleteConfirmation && (
                    <>
                        <div
                            title="Edit"
                            role="button"
                            onClick={doEdit}
                            className="absolute top-0 right-8 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
                        >
                            <FiEdit size={20} />
                        </div>
                        {
                            (props.item.listingType !== "stream") && <div
                                title="Move"
                                role="button"
                                onClick={doMove}
                                className={`absolute top-0 right-16 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ${moveItem?._id === props.item._id ? 'rounded-full bg-internalCardIconSelectedBg text-internalCardIconSelectedColor' : 'text-internalCardIconColor hover:text-internalCardIconHoverColor'}`}
                            >
                                <TbHandMove size={20} />
                            </div>
                        }
                    </>
                )}
            </motion.div>
        </Link>
    );
};


SingleListing.propTypes = {
    item: PropTypes.object.isRequired,
    deleteListing: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
}

const MemoizedComponent = React.memo(SingleListing);
export default MemoizedComponent;
