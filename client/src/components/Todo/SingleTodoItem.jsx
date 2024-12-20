import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { deletedTodoState, editedTodoState, loadingState, loginState, newDeleteModalState, newTodoModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import { motion } from 'framer-motion';
import makeToast from '../../utils/ToastUtils';

// Define prop types for the component
const todoShape = PropTypes.shape({
    _id: PropTypes.string.isRequired,
    todoItem: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    dueDate: PropTypes.string,
    priority: PropTypes.number,
    parent: PropTypes.shape({
        listingName: PropTypes.string
    })
});

const SingleTodoItem = ({ listingId, todo }) => {
    const setLoading = useSetRecoilState(loadingState);
    const loginData = useRecoilValue(loginState);
    const [todoItem, setTodoItem] = useState(todo);
    const setModalState = useSetRecoilState(newTodoModalState);
    const setDeleteModalState = useSetRecoilState(newDeleteModalState);

    const [editedTodo, setEditedTodo] = useRecoilState(editedTodoState);
    const [deletedTodo, setDeletedTodo] = useRecoilState(deletedTodoState);
    const [isDeleted, setIsdeleted] = useState(false);

    useEffect(() => {
        if (editedTodo?._id === todoItem?._id) {
            setTodoItem(editedTodo);
            setEditedTodo(null);
        }
    }, [editedTodo, setEditedTodo, todoItem]);

    useEffect(() => {
        if (deletedTodo?._id === todoItem?._id) {
            setIsdeleted(true);
            setDeletedTodo(null);
        }
    }, [deletedTodo, setDeletedTodo, todoItem]);

    const manageCompleted = () => {
        setLoading(true);
        ApiService.get(`/api/v1/todo/completion/${todo?._id}`, loginData?.token)
            .then(data => {
                setTodoItem(data?.message);
                makeToast("success", "Status changed successfully.");
            })
            .catch(() => {
                makeToast("Error", "Can not change status.");
            })
            .finally(() => {
                setLoading(false);
            });
    };


    return (
        !isDeleted && <div className="flex flex-row space-x-4 mb-4 rounded-lg p-2 items-center bg-taskCardBg border-taskCardBorder text-taskCardText hover:bg-taskCardHoverBg hover:border-taskCardHoverBorder hover:text-taskCardHoverText">
            <div className="w-full md:block">
                <div className="grid grid-cols-1 md:grid-cols-12 items-center p-2">
                    <div role="button" className={`cursor-pointer ${!listingId ? 'col-span-6 md:col-span-6' : 'col-span-6 md:col-span-8'} flex items-center`} onClick={manageCompleted}>
                        {todoItem.completed ? (
                            <div className="ml-2 w-4 h-4 rounded-full bg-taskStatusDotColor flex-shrink-0" />
                        ) : (
                            <div className="ml-2 w-4 h-4 rounded-full border border-taskStatusDotColor flex-shrink-0" />
                        )}
                        <h1 className={`ml-4 text-sm two-lines ${todoItem.completed ? 'line-through' : ''}`}>
                            {todoItem.todoItem}
                        </h1>
                    </div>
                    {!listingId && <div className="col-span-2 md:col-span-2 flex items-center justify-end md:justify-center mt-4 mr-2">
                        <span>
                            {todoItem?.parent?.listingName}
                        </span>
                    </div>}
                    <div className="col-span-2 md:col-span-2 flex items-center justify-end md:justify-center mt-4">
                        <span className={new Date(todoItem.dueDate) < new Date() ? 'text-red-500' : ''}>
                            {todoItem.dueDate ? new Date(todoItem.dueDate).toISOString().split('T')[0] : null}
                        </span>
                    </div>
                    <div className="col-span-1 md:col-span-1 flex items-center justify-end md:justify-center ml-4 mt-4">
                        {todoItem.priority === 3 && <div className="w-4 h-4 rounded-full bg-yellow-500" />}
                        {todoItem.priority === 2 && <div className="w-4 h-4 rounded-full bg-green-500" />}
                        {todoItem.priority === 1 && <div className="w-4 h-4 rounded-full bg-red-500" />}
                        {(todoItem.priority !== 1 && todoItem.priority !== 2 && todoItem.priority !== 3) && <div className="w-4 h-4 rounded-full bg-transparent" />}
                    </div>
                    <div className="col-span-1 md:col-span-1 flex items-center justify-end ml-4 mt-4">
                        <motion.div
                            whileHover={{ scale: 1.3 }}
                            className="cursor-pointer mr-4"
                            onClick={() => setModalState({ isOpen: true, data: { listingId, todoItem } })}
                        >
                            <RiEdit2Line className="cursor-pointer text-taskCardIconColor hover:text-taskCardIconHoverColor" />
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.3 }}
                            className="cursor-pointer mr-4"
                            onClick={() => setDeleteModalState({ isOpen: true, data: { listingId, todoItem } })}
                        >
                            <RiDeleteBinLine className="cursor-pointer text-taskCardIconColor hover:text-taskCardIconHoverColor" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add prop types validation
SingleTodoItem.propTypes = {
    listingId: PropTypes.string,
    todo: todoShape.isRequired
};

// Name the exported component for React Refresh
const NamedSingleTodoItem = React.memo(SingleTodoItem);
export default NamedSingleTodoItem;