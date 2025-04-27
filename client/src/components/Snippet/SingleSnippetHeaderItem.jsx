import React, { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import PropTypes from 'prop-types';
import { deleteSnippetModalState, newSnippetModalState } from "../../atoms";
import languagesList from "../../utils/LanguageList";
import { BsThreeDotsVertical } from "react-icons/bs";
import moment from 'moment';

const SingleSnippetHeaderItem = React.memo(function SingleSnippetHeaderItem({ snippet, listingId }) {
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const setModalState = useSetRecoilState(newSnippetModalState);
    const setDeleteSnippetModalState = useSetRecoilState(deleteSnippetModalState);
    const [snippetIcon, setSnippetIcon] = useState("/code.png");

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
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setDeleteSnippetModalState({ isOpen: true, data: { listingId, snippetItem: snippet } });
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpen(null);
        }
    };

    useEffect(() => {
        const language = languagesList.find(lang => lang.languageValue === snippet.snippetLanguage);
        setSnippetIcon(language?.languageIcon);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [snippet.snippetLanguage]);

    return (
        <>
            <div className="flex items-center">
                {/* deepsource-ignore JS-0760 */}
                <img 
                    src={snippetIcon} 
                    alt={snippet.languageName} 
                    onError={handleError} 
                    className="w-6 h-6 mr-4 rounded-full" 
                />
                <div>
                    <div className="line-clamp-2">{snippet.snippetTitle}</div>
                    <div className="text-sm">
                        {moment(snippet.createdAt).format('MMM Do YYYY, h:mm A')}
                    </div>
                </div>
            </div>
            <div className="relative" ref={menuRef}>
                <button 
                    className="focus:outline-none p-2 ml-2" 
                    onClick={toggleMenu}
                >
                    <BsThreeDotsVertical />
                </button>
                {menuOpen === snippet.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-snippetDropDownBg text-snippetDropDownText rounded-md shadow-lg z-10 border border-snippetDropDownBorder">
                        <button 
                            className="block px-4 py-2 text-sm hover:bg-snippetDropDownItemHoverBg w-full text-left" 
                            onClick={handleEdit}
                        >
                            Edit
                        </button>
                        <button 
                            className="block px-4 py-2 text-sm hover:text-snippetDropDownItemHoverText hover:bg-snippetDropDownItemHoverBg w-full text-left" 
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </>
    );
});

SingleSnippetHeaderItem.propTypes = {
    snippet: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        snippetTitle: PropTypes.string.isRequired,
        snippetLanguage: PropTypes.string.isRequired,
        languageName: PropTypes.string,
        createdAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date)
        ]).isRequired,
    }).isRequired,
    listingId: PropTypes.string.isRequired,
};

export default SingleSnippetHeaderItem;