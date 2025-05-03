import React, { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import PropTypes from 'prop-types';
import { deleteSnippetModalState, newSnippetModalState } from "../../atoms";
import languagesList from "../../utils/LanguageList";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash, FiTag } from "react-icons/fi";
import moment from 'moment';

const SingleSnippetHeaderItem = React.memo(function SingleSnippetHeaderItem({ snippet, listingId }) {
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const setModalState = useSetRecoilState(newSnippetModalState);
    const setDeleteSnippetModalState = useSetRecoilState(deleteSnippetModalState);
    const [snippetIcon, setSnippetIcon] = useState("/code.png");
    const [languageName, setLanguageName] = useState("");
    
    const handleError = () => {
        setSnippetIcon('/code.png');
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setMenuOpen(menuOpen === snippet.id ? null : snippet.id);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setModalState({ isOpen: true, data: { listingId, snippetItem: snippet } });
        setMenuOpen(null);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setDeleteSnippetModalState({ isOpen: true, data: { listingId, snippetItem: snippet } });
        setMenuOpen(null);
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpen(null);
        }
    };

    useEffect(() => {
        const language = languagesList.find(lang => lang.languageValue === snippet.snippetLanguage);
        setSnippetIcon(language?.languageIcon || '/code.png');
        setLanguageName(language?.languageName || "Unknown");
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [snippet.snippetLanguage]);

    const formattedDate = moment(snippet.createdAt).format('MMM D, YYYY');
    const timeAgo = moment(snippet.createdAt).fromNow();

    return (
        <div className="flex justify-between items-center w-full group">
            <div className="flex items-start space-x-3 overflow-hidden">
                <img 
                    src={snippetIcon} 
                    alt={languageName} 
                    onError={handleError} 
                    className="w-8 h-8 mt-1 object-contain" 
                />
                <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{snippet.snippetTitle}</div>
                    <div className="flex items-center text-xs text-snippedIconColor space-x-2 mt-1">
                        <div className="flex items-center">
                            <FiTag size={12} className="mr-1" />
                            <span>{languageName}</span>
                        </div>
                        <div title={formattedDate}>
                            {timeAgo}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="relative ml-2" ref={menuRef}>
                <button 
                    className="p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-snippetDropDownItemHoverBg" 
                    onClick={toggleMenu}
                    aria-label="Snippet options"
                >
                    <BsThreeDotsVertical className="text-snippedIconColor" />
                </button>
                
                {menuOpen === snippet.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-snippetDropDownBg text-snippetDropDownText rounded-md shadow-lg z-20 border border-snippetDropDownBorder overflow-hidden">
                        <button 
                            className="flex items-center px-4 py-3 text-sm hover:text-snippetDropDownItemHoverText hover:bg-snippetDropDownItemHoverBg w-full text-left transition-colors" 
                            onClick={handleEdit}
                        >
                            <FiEdit size={14} className="mr-2" />
                            Edit Snippet
                        </button>
                        
                        <button 
                            className="flex items-center px-4 py-3 text-sm hover:text-snippetDropDownItemHoverText hover:bg-snippetDropDownItemHoverBg w-full text-left text-red-500 hover:text-red-300 transition-colors" 
                            onClick={handleDelete}
                        >
                            <FiTrash size={14} className="mr-2" />
                            Delete Snippet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

SingleSnippetHeaderItem.propTypes = {
    snippet: PropTypes.shape({
        id: PropTypes.number.isRequired,
        snippetTitle: PropTypes.string.isRequired,
        snippetLanguage: PropTypes.string.isRequired,
        languageName: PropTypes.string,
        createdAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date)
        ]).isRequired,
    }).isRequired,
    listingId: PropTypes.number.isRequired,
};

export default SingleSnippetHeaderItem;