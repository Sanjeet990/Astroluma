import { useEffect, useState, useCallback } from 'react';
import NewTodoItemModal from '../Modals/NewTodoItemModal';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { addedTodoState, contentLoadingState, loginState, newTodoModalState } from '../../atoms';
import { useNavigate, useParams } from 'react-router-dom';
import { LuListTodo } from "react-icons/lu";
import { BsCalendarWeek, BsListUl } from "react-icons/bs";
import ApiService from '../../utils/ApiService';
import SingleTodoItem from './SingleTodoItem';
import TodoCalendarView from './TodoCalendarView';
import DeleteTodoModal from '../Modals/DeleteTodoModal';
import SelectList from '../Misc/SelectList';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import NoListing from '../Misc/NoListing';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceButton from '../NiceViews/NiceButton';
import makeToast from '../../utils/ToastUtils';
import emitter, { PAGE_BOTTOM_EVENT } from '../../events';

const TodoListing = () => {
    const params = useParams();
    const navigate = useNavigate();

    const listingId = params?.listingid;

    const setModalState = useSetRecoilState(newTodoModalState);
    const [addedTodo, setAddedTodo] = useRecoilState(addedTodoState);
    const [loading, setLoading] = useRecoilState(contentLoadingState);
    const loginData = useRecoilValue(loginState);

    const [todoItems, setTodoItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCompletedOption, setSelectedCompletedOption] = useState("all");
    const [selectedFilterOption, setSelectedFilterOption] = useState("default");
    const [listingName, setListingName] = useState(listingId ? "Todo List" : "Tasks");
    const [breadcrumbList, setBreadcrumbList] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
    const setActiveRoute = useCurrentRoute();

    const [localLoading, setLocalLoading] = useState(false);

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute(`/t/${listingId}`);
    }, [listingId, setActiveRoute]);

    const completeOptions = [
        { label: "All", value: "all" },
        { label: "Completed", value: "completed" },
        { label: "Pending", value: "pending" }
    ];

    const filterOptions = [
        { label: "Default", value: "default" },
        { label: "High to Low", value: "highToLow" },
        { label: "Low to High", value: "lowToHigh" },
        { label: "Due Date", value: "dueDate" }
    ];

    const containerVariants = {
        hidden: {
            opacity: 0,
            transition: {
                when: "afterChildren"
            }
        },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
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

    const handlePageBottomScroll = useCallback(() => {
        if (!loading && page < totalPages) {
            setPage(oldPage => oldPage + 1);
        }
    }, [loading, page, totalPages]);

    const fetchTodoItems = useCallback(async (pageNum) => {
        if (pageNum === 1) setLoading(true);
        else setLocalLoading(true);

        ApiService.get(`/api/v1/todo/${listingId || "all"}/items/${selectedCompletedOption}/${selectedFilterOption}/${pageNum}`, loginData?.token, navigate)
            .then(data => {

                if (pageNum === 1) {
                    setTodoItems(data?.message?.todoItems || []);
                } else {
                    setTodoItems(prev => [...prev, ...(data?.message?.todoItems || [])]);
                }

                setTotalPages(data?.message?.totalPages);

                if (data?.message?.todo) {
                    setListingName(data?.message?.todo?.listingName);
                }
                setBreadcrumbList(data?.message?.breadcrumb);

            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Cannot load data.");
            })
            .finally(() => {
                setLoading(false);
                setLocalLoading(false);
                setAddedTodo(null);
            });

    }, [listingId, selectedCompletedOption, selectedFilterOption, loginData?.token, setLoading, setAddedTodo, navigate]);

    useEffect(() => {
        emitter.on(PAGE_BOTTOM_EVENT, handlePageBottomScroll);

        if (listingId) {
            setActiveRoute(`/t/${listingId}`);
        }

        return () => {
            emitter.off(PAGE_BOTTOM_EVENT, handlePageBottomScroll);
        };
    }, [listingId, setActiveRoute, handlePageBottomScroll]);

    useEffect(() => {
        setPage(1);
        fetchTodoItems(1);
    }, [selectedCompletedOption, selectedFilterOption, fetchTodoItems]);

    useEffect(() => {
        if (page > 1) {
            fetchTodoItems(page);
        }
    }, [page, fetchTodoItems]);

    useEffect(() => {
        if (addedTodo) {
            setPage(1);
            fetchTodoItems(1);
        }
    }, [addedTodo, fetchTodoItems]);

    // Toggle between list and calendar views with data refresh
    const toggleViewMode = (mode) => {
        if (mode !== viewMode) {
            setViewMode(mode);
            setPage(1);
            fetchTodoItems(1); // Refresh data when switching views
        }
    };

    return (
        <>
            <Helmet>
                <title>{listingName}</title>
            </Helmet>

            <NewTodoItemModal />
            <DeleteTodoModal />

            <Breadcrumb type="front" pageTitle={listingName} breadcrumbList={breadcrumbList} />

            {/* View Controls - Minimalist Tab Design */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                    {/* Minimal Tab-Style View Switcher */}
                    <div className="flex border-cardBorder/30">
                        <button 
                            onClick={() => toggleViewMode("list")}
                            className={`px-4 py-2 flex items-center space-x-2 ${
                                viewMode === 'list' 
                                ? 'border-b-4 border-buttonGeneric text-white' 
                                : 'text-bodyText hover:text-white'
                            }`}
                        >
                            <BsListUl size={16} />
                            <span className="font-medium">List</span>
                        </button>
                        
                        <button 
                            onClick={() => toggleViewMode("calendar")}
                            className={`px-4 py-2 flex items-center space-x-2 ${
                                viewMode === 'calendar' 
                                ? 'border-b-4 border-buttonGeneric text-white' 
                                : 'text-bodyText hover:text-white'
                            }`}
                        >
                            <BsCalendarWeek size={16} />
                            <span className="font-medium">Calendar</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Action Controls */}
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 items-center w-full md:w-auto">
                    <SelectList
                        className="w-full md:w-auto"
                        listItems={completeOptions}
                        selected={selectedCompletedOption}
                        onChange={(e) => setSelectedCompletedOption(e.target.value)}
                    />
                    
                    {/* Only show sort options in list view */}
                    {viewMode === "list" && (
                        <SelectList
                            listItems={filterOptions}
                            selected={selectedFilterOption}
                            onChange={(e) => setSelectedFilterOption(e.target.value)}
                        />
                    )}
                    
                    <NiceButton
                        label='New Todo'
                        className="bg-buttonGeneric text-buttonText w-full md:w-auto"
                        onClick={() => setModalState({ isOpen: true, data: { listingId, todoItem: null } })}
                    />
                </div>
            </div>

            <div className="mb-4">
                {todoItems?.length > 0 ? (
                    <>
                        <AnimatePresence mode="wait">
                            {viewMode === "list" ? (
                                <motion.div
                                    key="list-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="space-y-4"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        {todoItems.map((todo, index) => (
                                            <motion.div
                                                key={`${todo.id}-${index}`}
                                                variants={itemVariants}>
                                                <SingleTodoItem listingId={listingId} todo={todo} />
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {localLoading && page > 1 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-12 w-full flex items-center justify-center text-gray-500"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                                                <span>Loading more todos...</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(!localLoading && page === totalPages) && (
                                        <div className="h-12 w-full flex items-center justify-center text-gray-500">
                                            <span>No more todos to load</span>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="calendar-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TodoCalendarView 
                                        todoItems={todoItems} 
                                        onSwitchToList={() => toggleViewMode("list")}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {selectedItem && (
                                <NiceButton
                                    label="Close"
                                    className="bg-buttonDanger text-buttonText"
                                    onClick={() => setSelectedItem(null)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    !localLoading && (
                        <NoListing
                            mainText="Oops! Nothing to List here"
                            subText="Please create some todo items first"
                            buttonText="Go to home"
                            buttonLink="/"
                            displayIcon={<LuListTodo />}
                        />
                    )
                )}
            </div>
        </>
    );
};

export default TodoListing;