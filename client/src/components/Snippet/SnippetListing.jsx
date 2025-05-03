import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from "react-helmet";
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NewSnippetItemModal from '../Modals/NewSnippetItemModal';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { contentLoadingState, deletedSnippetState, filterQueryState, loginState, newSnippetModalState, savedSnippetState } from '../../atoms';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../utils/ApiService';
import SingleSnippetItem from './SingleSnippetItem';
import SingleSnippetHeaderItem from './SingleSnippetHeaderItem';
import DeleteSnippetItemModal from '../Modals/DeleteSnippetItemModal';
import NiceButton from '../NiceViews/NiceButton';
import { motion, AnimatePresence } from 'framer-motion';
import makeToast from '../../utils/ToastUtils';
import PropTypes from 'prop-types';
import { FiSearch, FiPlus, FiChevronLeft, FiX } from 'react-icons/fi';
import { BiSortAlt2 } from 'react-icons/bi';

const SnippetListing = () => {
    const navigate = useNavigate();

    const params = useParams();
    const parentId = params?.listingid;
    const contentRef = useRef(null);
    const [selectedSnippet, setSelectedSnippet] = useState(null);
    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(contentLoadingState);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lastSearchTerm, setLastSearchTerm] = useState("");
    const [snippets, setSnippets] = useState([]);
    const setModalState = useSetRecoilState(newSnippetModalState);
    const deletedSnippet = useRecoilValue(deletedSnippetState);
    const [savedSnippet, setSavedSnippet] = useRecoilState(savedSnippetState);
    const globalFilterQuery = useRecoilValue(filterQueryState);
    const [sortOrder, setSortOrder] = useState('newest');
    const [localSearch, setLocalSearch] = useState('');
    const [breadcrumbData, setBreadcrumbData] = useState(null);

    useDynamicFilter(true);
    useCurrentRoute(`/s/${parentId}`);

    const handleSnippetClick = (snippet) => {
        setSelectedSnippet(snippet);
        // Scroll to the top when selecting a snippet on mobile
        if (window.innerWidth < 768 && contentRef.current) {
            contentRef.current.parentNode.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Main data fetching effect
    useEffect(() => {
        const fetchSnippets = async () => {
            setLoading(true);

            const tempPage = globalFilterQuery !== lastSearchTerm ? 1 : page;
            let path = `/api/v1/snippet/${parentId}/items/${tempPage}`;

            if (globalFilterQuery) {
                path += `/search/${globalFilterQuery}`;
            }

            ApiService.get(path, loginData?.token, navigate)
                .then((data) => {
                    setPage(data.message.currentPage);
                    setTotalPages(data.message.totalPages);

                    if ((globalFilterQuery && tempPage === 1) || (!globalFilterQuery && page === 1)) {
                        setSnippets(data.message.snippets);
                    } else {
                        setSnippets(prevSnippets => [...prevSnippets, ...data.message.snippets]);
                    }

                    // Set breadcrumb data if available
                    if (data.message.breadcrumb) {
                        setBreadcrumbData(data.message.breadcrumb);
                    }

                    if (data.message.snippet) {
                        document.title = `${data.message.snippet.listingName} - Code Snippets`;
                    }

                    setLastSearchTerm(globalFilterQuery || "");
                })
                .catch((error) => {
                    if (!error.handled) makeToast("error", "Can not load data.");
                }).finally(() => {
                    setLoading(false);
                });
        };

        fetchSnippets();
    }, [page, globalFilterQuery, parentId, loginData?.token, lastSearchTerm, setLoading, navigate]);

    // Handle deleted snippets
    useEffect(() => {
        if (deletedSnippet) {
            setSnippets(prevSnippets =>
                prevSnippets.filter(snippet => snippet.id !== deletedSnippet.id)
            );
            setSelectedSnippet(null);
        }
    }, [deletedSnippet]);

    // Handle saved snippets
    useEffect(() => {
        if (savedSnippet) {
            if (savedSnippet.action === 'add') {
                setSnippets(prevSnippets => [savedSnippet.snippet, ...prevSnippets]);
                // Defer the state updates to the next tick
                Promise.resolve().then(() => {
                    setSelectedSnippet(savedSnippet.snippet);
                    setSavedSnippet(null);
                });
            } else {
                setSnippets(prevSnippets =>
                    prevSnippets.map(snippet =>
                        snippet.id === savedSnippet.snippet.id ? savedSnippet.snippet : snippet
                    )
                );
            }
        }
    }, [savedSnippet, setSavedSnippet]);

    const addNewSnippetItem = () => {
        setModalState({ isOpen: true, data: { listingId: parentId } });
    };

    const handleLocalSearch = (e) => {
        setLocalSearch(e.target.value);
    };

    const clearLocalSearch = () => {
        setLocalSearch('');
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
    };

    // Apply local sorting and filtering
    const sortAndFilterSnippets = () => {
        let filtered = [...snippets];

        // Apply local search if defined
        if (localSearch) {
            const lowercaseQuery = localSearch.toLowerCase();
            filtered = filtered.filter(snippet =>
                snippet.snippetTitle.toLowerCase().includes(lowercaseQuery) ||
                snippet.snippetLanguage?.toLowerCase().includes(lowercaseQuery)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    };

    const filteredSnippets = sortAndFilterSnippets();

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div ref={contentRef}>
            <Helmet>
                <title>Code Snippets</title>
            </Helmet>

            <NewSnippetItemModal />
            <DeleteSnippetItemModal />

            <Breadcrumb
                type="front"
                pageTitle={"Code Snippets"}
                breadcrumbList={breadcrumbData}
            />

            <div className="mt-6 flex flex-col md:flex-row md:space-x-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`md:w-1/3 lg:w-1/4 w-full ${selectedSnippet && 'hidden md:block'} bg-snippetCardBg border border-snippetCardBorder rounded-lg shadow-md mb-6 md:mb-0`}
                >
                    <div className="p-4 border-b border-snippetCardBorder flex justify-between items-center">
                        <h2 className="font-medium text-lg text-snippetCardText">Snippets</h2>
                        <NiceButton
                            label="New"
                            icon={<FiPlus size={16} />}
                            className="cursor-pointer text-sm py-2 px-4 rounded-full m-1 text-xs transition-all duration-200 bg-buttonGeneric text-buttonText"
                            onClick={addNewSnippetItem}
                        />
                    </div>

                    <div className="overflow-y-auto">
                        <AnimatePresence>
                            {filteredSnippets.length === 0 ? (
                                <div className="p-8 text-center text-snippedIconColor">
                                    {localSearch ? (
                                        <p>No snippets match your search</p>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <p className="mb-4">No snippets found</p>
                                            <button
                                                onClick={addNewSnippetItem}
                                                className="text-snippedIconColor hover:text-snippedIconHoverColor underline"
                                            >
                                                Create your first snippet
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {filteredSnippets.map((snippet, index) => (
                                        <motion.div
                                            key={`${snippet.id}-${index}`}
                                            variants={itemVariants}
                                            className={`p-4 border-b border-snippetCardBorder cursor-pointer transition-colors ${selectedSnippet?.id === snippet.id
                                                    ? 'bg-snippetSingleItemSelectedBg text-snippetSingleItemSelectedText'
                                                    : 'hover:bg-snippetSingleItemHoverBg'
                                                }`}
                                            onClick={() => handleSnippetClick(snippet)}
                                        >
                                            <SingleSnippetHeaderItem snippet={snippet} listingId={parentId} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {page < totalPages && (
                        <div className="p-3 border-t border-snippetCardBorder">
                            <NiceButton
                                label='Load More'
                                onClick={() => setPage(page + 1)}
                                parentClassname='w-full'
                                className='w-full bg-buttonGeneric text-buttonText'
                            />
                        </div>
                    )}
                </motion.div>

                <div className={`md:w-2/3 lg:w-3/4 w-full ${selectedSnippet ? 'block' : 'hidden md:block'} bg-snippetCardBg border border-snippetCardBorder rounded-lg shadow-md overflow-hidden`}>
                    <AnimatePresence mode="wait">
                        {selectedSnippet ? (
                            <motion.div
                                key={selectedSnippet.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="p-4 border-b border-snippetCardBorder flex justify-between items-center">
                                    <div className="flex items-center">
                                        {window.innerWidth < 768 && (
                                            <button
                                                onClick={() => setSelectedSnippet(null)}
                                                className="mr-2 p-2 rounded-full hover:bg-snippetSingleItemHoverBg text-snippedIconColor"
                                            >
                                                <FiChevronLeft size={20} />
                                            </button>
                                        )}
                                        <h2 className="text-xl font-semibold line-clamp-1 text-selectedSnippetTitleText">
                                            {selectedSnippet.snippetTitle}
                                        </h2>
                                    </div>
                                </div>
                                <SingleSnippetItem snippet={selectedSnippet} />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center p-8 text-center"
                                style={{ minHeight: '300px' }}
                            >
                                <div className="bg-snippetSingleItemBorder bg-opacity-20 p-4 rounded-full mb-4">
                                    <FiSearch size={32} className="text-snippedIconColor" />
                                </div>
                                <h3 className="text-xl font-medium mb-2 text-snippetCardText">Select a snippet</h3>
                                <p className="text-snippedIconColor mb-6">Choose a snippet from the left panel to view its content</p>
                                <NiceButton
                                    label="Create New Snippet"
                                    icon={<FiPlus size={16} />}
                                    className="cursor-pointer text-sm py-2 px-4 rounded-full m-1 text-xs transition-all duration-200 bg-buttonGeneric text-buttonText"
                                    onClick={addNewSnippetItem}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

SnippetListing.propTypes = {
    snippet: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }),
};

const MemoizedComponent = React.memo(SnippetListing);
export default MemoizedComponent;