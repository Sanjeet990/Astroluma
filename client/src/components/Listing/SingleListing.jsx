import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { FiEdit, FiMove, FiTrash } from 'react-icons/fi';
import { TbHandMove } from "react-icons/tb";
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

import ImageView from '../Misc/ImageView';
import NiceButton from '../NiceViews/NiceButton';
import { colorThemeState, moveItemState } from '../../atoms';
import makeToast from '../../utils/ToastUtils';
import SystemThemes from '../../utils/SystemThemes';

const LISTING_TYPES = {
    category: {
        path: 'folder',
        defaultIcon: '/folder.png'
    },
    todo: {
        path: 'todo',
        defaultIcon: '/todo.png'
    },
    stream: {
        path: 'stream',
        defaultIcon: '/cctv.png'
    },
    link: {
        path: 'link',
        defaultIcon: '/link.png'
    },
    snippet: {
        path: 'snippet',
        defaultIcon: '/link.png'
    }
};

const SingleListing = ({ item, deleteListing, id }) => {
    const navigate = useNavigate();
    const [moveItem, setMoveItem] = useRecoilState(moveItemState);
    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    // Memoize the style object
    const style = useMemo(() => ({
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? "100" : "auto",
        opacity: isDragging ? 0.3 : 1
    }), [transform, transition, isDragging]);

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type ?? "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    const decideLink = useCallback((edit = false) => {
        const type = LISTING_TYPES[item.listingType] || LISTING_TYPES.link;
        const baseUrl = '/manage/listing';
        return edit
            ? `${baseUrl}/save/${type.path}/${item._id}`
            : item.listingType === 'category'
                ? `${baseUrl}/${item._id}`
                : `${baseUrl}/save/${type.path}/${item._id}`;
    }, [item._id, item.listingType]);

    const decideTheIcon = useCallback(() => {
        const iconObject = item?.listingIconItem;
        return (themeType === "dark" && iconObject?.iconUrlLight)
            ? iconObject.iconUrlLight
            : iconObject?.iconUrl;
    }, [item?.listingIconItem, themeType]);

    const getDefaultIcon = useCallback(() => {
        return LISTING_TYPES[item.listingType]?.defaultIcon || LISTING_TYPES.link.defaultIcon;
    }, [item.listingType]);

    const handleDeleteClick = (e) => {
        e.preventDefault();
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = (e) => {
        e.preventDefault();
        deleteListing(item._id);
        setShowDeleteConfirmation(false);
    };

    const handleCancelDelete = (e) => {
        e.preventDefault();
        setShowDeleteConfirmation(false);
    };

    const handleEdit = (e) => {
        e.preventDefault();
        navigate(decideLink(true));
    };

    const handleMove = (e) => {
        e.preventDefault();
        if (moveItem?._id === item._id) {
            setMoveItem(null);
        } else {
            setMoveItem(item);
            makeToast("info", "Select a folder to move this item to.");
        }
    };

    const renderDeleteConfirmation = () => (
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
    );

    const renderContent = () => (
        <>
            <div className='flex items-center justify-center p-8'>
                <ImageView
                    alt="Link"
                    src={decideTheIcon()}
                    defaultSrc={getDefaultIcon()}
                    errorSrc={getDefaultIcon()}
                    height="80px"
                    width="80px"
                />
            </div>
            <div className='flex items-center justify-center text-center overflow-hidden !min-h-20 !max-h-20'>
                {item.listingName}
            </div>
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
    );

    const renderActions = () => (
        <>
            {
                item?.onFeatured && <div
                    className="absolute opacity-70 bottom-2 left-2 flex justify-center items-center bg-red-600 py-0.5 px-1 text-xs rounded-md z-5"
                >
                    Featured
                </div>
            }
            <div
                title="Delete"
                role="button"
                onClick={handleDeleteClick}
                className="absolute top-0 right-0 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ml-8 text-internalCardIconColor hover:text-internalCardIconHoverColor"
            >
                <FiTrash size={20} />
            </div>
            <div
                title="Edit"
                role="button"
                onClick={handleEdit}
                className="absolute top-0 right-8 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 text-internalCardIconColor hover:text-internalCardIconHoverColor"
            >
                <FiEdit size={20} />
            </div>
            {item.listingType !== "stream" && (
                <div
                    title="Move"
                    role="button"
                    onClick={handleMove}
                    className={`absolute top-0 right-16 p-2 cursor-pointer opacity-50 m-2 transition-opacity hover:opacity-100 ${moveItem?._id === item._id
                        ? 'rounded-full bg-internalCardIconSelectedBg text-internalCardIconSelectedColor'
                        : 'text-internalCardIconColor hover:text-internalCardIconHoverColor'
                        }`}
                >
                    <TbHandMove size={20} />
                </div>
            )}
        </>
    );

    return (
        <Link
            style={style}
            ref={setNodeRef}
            to={showDeleteConfirmation || moveItem?._id === item._id ? null : decideLink()}
            className="relative"
        >
            <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative border-2 border-internalCardBorder bg-internalCardBg text-internalCardText pt-10 pb-10 rounded-xl shadow-md h-80"
                style={{ overflow: 'hidden' }}
            >
                {showDeleteConfirmation ? renderDeleteConfirmation() : renderContent()}
                {!showDeleteConfirmation && renderActions()}
            </motion.div>
        </Link>
    );
};

SingleListing.propTypes = {
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        listingType: PropTypes.string.isRequired,
        listingName: PropTypes.string.isRequired,
        listingIconItem: PropTypes.shape({
            iconUrl: PropTypes.string,
            iconUrlLight: PropTypes.string
        })
    }).isRequired,
    deleteListing: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
};

export default React.memo(SingleListing);