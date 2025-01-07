import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from "react-helmet"
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
import { motion } from 'framer-motion';
import makeToast from '../../utils/ToastUtils';
import PropTypes from 'prop-types';

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

    useDynamicFilter(true);
    useCurrentRoute(`/s/${parentId}`);

    const handleSnippetClick = (snippet) => {
        setSelectedSnippet(snippet);
        if (contentRef.current) {
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
                prevSnippets.filter(snippet => snippet._id !== deletedSnippet._id)
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
                        snippet._id === savedSnippet.snippet._id ? savedSnippet.snippet : snippet
                    )
                );
            }
        }
    }, [savedSnippet, setSavedSnippet]);

    const addNewSnippetItem = () => {
        setModalState({ isOpen: true, data: { listingId: parentId } });
    };


    const itemVariants = {
        hidden: {
            opacity: 0,
            x: -100
        },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
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

            <Breadcrumb type="front" pageTitle={"Code Snippets"} breadcrumbList={null} />

            <div className="flex flex-col md:flex-row h-screen">
                <div className={`md:w-1/4 w-full ${selectedSnippet && 'hidden md:block'} md:p-4`}>
                    <div className="min-w-full rounded-lg shadow-lg card bg-snippetCardBg text-snippetCardText border border-snippetCardBorder shadow-md rounded-xl">
                        <table className="w-full px-8 pt-6 pb-8 mb-4">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 rounded-t-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-left">Snippets</span>
                                            <NiceButton
                                                label="New Snippet"
                                                className="bg-buttonGeneric text-buttonText"
                                                onClick={addNewSnippetItem}
                                            />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {snippets.length === 0 ? (
                                    <tr>
                                        <td className="py-2 px-4">
                                            <div className="flex items-center justify-center h-32">
                                                <p>No snippets found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    snippets.map((snippet, index) => (
                                        <motion.tr
                                            key={`${snippet._id}-${index}`}
                                            variants={itemVariants}
                                            onClick={() => handleSnippetClick(snippet)}
                                        >
                                            <td className={`py-2 px-4 cursor-pointer border-t ${selectedSnippet?._id === snippet._id ? 'bg-snippetSingleItemSelectedBg border-snippetSingleItemSelectedBorder text-snippetSingleItemSelectedText' : 'border-snippetSingleItemBorder hover:bg-snippetSingleItemHoverBg hover:text-snippetSingleItemHoverText hover:border-snippetSingleItemHoverBorder'} flex items-center justify-between transition-colors`}>
                                                <SingleSnippetHeaderItem snippet={snippet} listingId={parentId} />
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        {page < totalPages ? (
                            <button
                                className="w-full bg-blue-500 py-2 px-4 rounded-full mb-4"
                                onClick={() => setPage(page + 1)}
                            >
                                Load More
                            </button>
                        ) : (
                            <div className='pb-4 mb-4 flex justify-center'>
                                At the end
                            </div>
                        )}
                    </div>
                </div>
                <div className={`md:w-3/4 w-full h-full ${selectedSnippet ? 'block' : 'hidden md:block'} md:p-4`}>
                    <div className="card bg-snippetCardBg text-snippetCardText border border-snippetCardBorder shadow-md rounded-xl p-4">
                        {selectedSnippet ? (
                            <>
                                <div className="flex justify-between items-center mb-4 ">
                                    <h2 className="text-xl line-clamp-3 text-selectedSnippetTitleText">
                                        {selectedSnippet.snippetTitle}
                                    </h2>
                                    <NiceButton
                                        label='Back'
                                        className='block md:hidden bg-buttonGeneric text-buttonText'
                                        onClick={() => setSelectedSnippet(null)}
                                    />
                                </div>
                                <SingleSnippetItem snippet={selectedSnippet} />
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p>Select a snippet to view</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


SnippetListing.propTypes = {
    snippet: PropTypes.shape({
        _id: PropTypes.string.isRequired,
    }),
};

const MemoizedComponent = React.memo(SnippetListing);
export default MemoizedComponent;