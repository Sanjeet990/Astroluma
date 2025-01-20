import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { addedTodoState, editedTodoState, loadingState, loginState, newTodoModalState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import NiceButton from '../NiceViews/NiceButton';
import NiceCheckbox from '../NiceViews/NiceCheckbox';
import NiceInput from '../NiceViews/NiceInput';
import NiceModal from '../NiceViews/NiceModal';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';

const NewTodoItemModal = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useRecoilState(newTodoModalState);
  const loginData = useRecoilValue(loginState);
  const [todoName, setTodoName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [enableDueDate, setEnableDueDate] = useState(false);
  const [priority, setPriority] = useState(3);
  const setLoading = useSetRecoilState(loadingState);
  const setEditedTodo = useSetRecoilState(editedTodoState);
  const setAddedTodo = useSetRecoilState(addedTodoState);

  useEffect(() => {
    if (modalState.data?.todoItem) {
      setTodoName(modalState.data?.todoItem.todoItem);
      setEnableDueDate(modalState.data?.todoItem.dueDate ? true : false);
      setDueDate(modalState.data?.todoItem.dueDate ? new Date(modalState.data.todoItem.dueDate).toISOString().split('T')[0] : '');
      setPriority(modalState.data?.todoItem.priority);
    } else {
      setTodoName('');
      setDueDate('');
      setEnableDueDate(false);
      setPriority(3);
    }
  }, [modalState]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISOString = today.toLocaleDateString('fr-CA');

  const closeModal = () => {
    setModalState({ isOpen: false, data: {} });
  };

  const createNewTodoItem = () => {
    if (!todoName) {
      makeToast("warning", 'Please enter todo item.');
      return;
    }

    if (enableDueDate && !dueDate) {
      makeToast("warning", 'Please select a due date.');
      return;
    }

    setLoading(true);

    const newTodoItem = {
      listingId: modalState.data?.listingId,
      todoId: modalState.data?.todoItem ? modalState.data?.todoItem._id : null,
      todoName,
      priority,
      dueDate: enableDueDate ? dueDate : null,
    };

    ApiService.post('/api/v1/todo/item', newTodoItem, loginData?.token, navigate)
      .then(data => {
        makeToast("success", 'Todo item saved.');
        setTodoName('');
        setDueDate('');
        setEnableDueDate(false);
        modalState.data?.todoItem ? setEditedTodo(data.message) : setAddedTodo(data.message);
        closeModal();
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", 'Can not save todo item.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <NiceModal
      show={modalState.isOpen}
      title='New Todo Item'
      body={
        <>
        <div className="mb-4">
                <label className="block mb-2" htmlFor="todoName">
                  Todo Item
                </label>
                <textarea
                  className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-modalInputBg border-modalInputBorder text-modalInputText placeholder-modalInputPlaceholder resize-none"
                  id="todoName"
                  value={todoName}
                  rows={4}
                  onChange={(e) => setTodoName(e.target.value)}
                  placeholder="Enter todo item"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2" htmlFor="priority">
                  Priority
                </label>
                <select
                  className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline border-modalInputBorder bg-modalInputBg text-modalInputText"
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="1">High</option>
                  <option value="2">Medium</option>
                  <option value="3">Low</option>
                </select>
              </div>

              <NiceCheckbox
                label='Select Due Date'
                checked={enableDueDate}
                onChange={(e) => setEnableDueDate(e.target.checked)}
              />

              {
                enableDueDate && <>
                  <NiceInput
                    label='Due Date'
                    type='date'
                    value={dueDate}
                    className='bg-modalInputBg border-modalInputBorder text-modalInputText placeholder-modalInputPlaceholder'
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const thisDay = new Date();
                      thisDay.setHours(0, 0, 0, 0);
                      if (selectedDate >= thisDay) {
                        setDueDate(e.target.value);
                      }
                    }}
                    placeholder='Select due date'
                    min={todayISOString}
                  />
                  <div className="flex justify-between mt-4 mb-4">
                    <NiceButton
                      label='Today'
                      className="bg-buttonGeneric text-buttonText"
                      onClick={() => setDueDate(todayISOString)}
                    />
                    <NiceButton
                      label='Tomorrow'
                      className="bg-buttonGeneric text-buttonText"
                      onClick={() => {
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setDueDate(tomorrow.toLocaleDateString('fr-CA'));
                      }}
                    />
                    <NiceButton
                      label='Clear Date'
                      className="bg-buttonDanger text-buttonText"
                      onClick={() => setDueDate("")}
                    />
                  </div>
                </>
              }
        </>
      }
      footer={
        <NiceButton
          label='Save'
          className="bg-buttonSuccess text-buttonText"
          onClick={createNewTodoItem}
        />
      }
      closeModal={closeModal}
    />
  )

}

const MemoizedComponent = React.memo(NewTodoItemModal);
export default MemoizedComponent;
