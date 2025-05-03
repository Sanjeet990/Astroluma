import React, { useCallback, useEffect, useState, useRef } from "react";
import { FaPlus, FaSearch } from 'react-icons/fa';
import { IoFilter } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { contentLoadingState, loginState, newDeleteCodeModalState, newSnippetCodeModalState } from "../../atoms";
import ApiService from '../../utils/ApiService';
import SingleCodeItem from "./SingleCodeItem";
import NewSnippetCodeItemModal from "../Modals/NewSnippetCodeItemModal";
import DeleteCodeItemModal from "../Modals/DeleteCodeItemModal";
import NiceButton from "../NiceViews/NiceButton";
import { motion, AnimatePresence } from "framer-motion";
import makeToast from "../../utils/ToastUtils";
import PropTypes from "prop-types";
import emitter, { RELOAD_CODE_SNIPPET } from "../../events";
import { useNavigate } from "react-router-dom";
import languagesList from "../../utils/LanguageList";

const SingleSnippetItem = ({ snippet }) => {
    const navigate = useNavigate();

    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(contentLoadingState);
    const setModalState = useSetRecoilState(newSnippetCodeModalState);
    const setDeleteModalState = useSetRecoilState(newDeleteCodeModalState);
    const [fileList, setFileList] = useState([]);
    const [filteredFileList, setFilteredFileList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const reloadCodeSnippetsRef = useRef(null);

    const reloadCodeSnippets = useCallback(() => {
        setLoading(true);
        ApiService.get(`/api/v1/snippet/list/${snippet?.id}`, loginData?.token, navigate)
            .then(data => {
                setFileList(data.message.snippetItems);
                setFilteredFileList(data.message.snippetItems);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Can not load data.");
            }).finally(() => {
                setLoading(false);
            });
    }, [snippet, loginData, setLoading, navigate]);

    // Store the current callback in a ref so we can access it in the cleanup function
    useEffect(() => {
        reloadCodeSnippetsRef.current = reloadCodeSnippets;
    }, [reloadCodeSnippets]);

    useEffect(() => {
        // Use the current function from ref to ensure consistent reference
        const handleReload = () => {
            if (reloadCodeSnippetsRef.current) {
                reloadCodeSnippetsRef.current();
            }
        };

        emitter.on(RELOAD_CODE_SNIPPET, handleReload);

        return () => {
            emitter.off(RELOAD_CODE_SNIPPET, handleReload);
        };
    }, []);

    useEffect(() => {
        reloadCodeSnippets();
    }, [snippet, reloadCodeSnippets]);

    // Filter files based on search term and language filter
    useEffect(() => {
        const filterResults = () => {
            let results = [...fileList];

            if (searchTerm) {
                const lowercasedQuery = searchTerm.toLowerCase();
                results = results.filter(file =>
                    file.snippetFilename?.toLowerCase().includes(lowercasedQuery) ||
                    file.snippetCode?.toLowerCase().includes(lowercasedQuery)
                );
            }

            if (selectedLanguage) {
                results = results.filter(file =>
                    file.snippetLanguage === selectedLanguage
                );
            }

            setFilteredFileList(results);
        };

        filterResults();
    }, [fileList, searchTerm, selectedLanguage]);

    const addNewFile = () => {
        setModalState({ isOpen: true, data: { snippetId: snippet?.id } })
    }

    const editCodeFile = (file) => {
        setModalState({ isOpen: true, data: { snippetId: snippet?.id, snippetItem: file } })
    }

    const deleteCodeFile = (file) => {
        setDeleteModalState({ isOpen: true, data: { snippetId: snippet?.id, snippetItem: file } })
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }

    const clearSearch = () => {
        setSearchTerm('');
    }

    const handleLanguageFilter = (e) => {
        setSelectedLanguage(e.target.value);
    }

    return (
        <>
            <NewSnippetCodeItemModal />
            <DeleteCodeItemModal />

            <div className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-1/2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="text-snippedIconColor" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Snippet Items"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full py-2 pl-10 pr-10 text-snippetCardText bg-snippetCardBg border border-snippetSingleItemBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-snippedIconHoverColor"
                        />
                        {searchTerm && (
                            <button
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-snippedIconColor hover:text-snippedIconHoverColor"
                                onClick={clearSearch}
                                aria-label="Clear search"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <IoFilter className="text-snippedIconColor" />
                            <select
                                value={selectedLanguage}
                                onChange={handleLanguageFilter}
                                className="py-2 px-3 text-snippetCardText bg-snippetCardBg border border-snippetSingleItemBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-snippedIconHoverColor"
                            >
                                <option value="">All Languages</option>
                                {languagesList.map(lang => (
                                    <option key={lang.languageValue} value={lang.languageValue}>{lang.languageName}</option>
                                ))}
                            </select>
                        </div>
                        <NiceButton
                            label="Add Code"
                            icon={<FaPlus size={16} />}
                            className="cursor-pointer text-sm py-2 px-4 rounded-full m-1 text-xs transition-all duration-200 bg-buttonGeneric text-buttonText"
                            onClick={addNewFile}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {filteredFileList.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-32 border border-dashed border-snippetSingleItemBorder rounded-lg p-6"
                        >
                            {searchTerm || selectedLanguage ? (
                                <p className="text-snippetCardText text-center mb-2">No matching snippets found</p>
                            ) : (
                                <>
                                    <p className="text-snippetCardText text-center mb-2">No snippets here yet</p>
                                    <button
                                        onClick={addNewFile}
                                        className="text-snippedIconColor hover:text-snippedIconHoverColor underline"
                                    >
                                        Add your first code snippet
                                    </button>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredFileList.map((file, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    key={`${file.id}-${index}`}
                                    className="border border-snippetSingleItemBorder hover:border-snippetSingleItemHoverBorder rounded-lg overflow-hidden bg-snippetCardBg transition-colors"
                                >
                                    <SingleCodeItem key={index} snippet={file} editCodeFile={() => editCodeFile(file)} deleteCodeFile={() => deleteCodeFile(file)} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

SingleSnippetItem.propTypes = {
    snippet: PropTypes.object.isRequired
}

const MemoizedComponent = React.memo(SingleSnippetItem);
export default MemoizedComponent;