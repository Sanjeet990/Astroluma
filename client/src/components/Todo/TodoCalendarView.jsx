import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCircle, FaInfoCircle } from 'react-icons/fa';
import { BsListUl } from "react-icons/bs";
import SingleTodoItem from './SingleTodoItem';

const TodoCalendarView = ({ todoItems, onSwitchToList }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [todosByDate, setTodosByDate] = useState({});
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDayTodos, setSelectedDayTodos] = useState([]);

    // Function to navigate to previous month
    const previousMonth = () => {
        setCurrentDate(prevDate => subMonths(prevDate, 1));
        setSelectedDay(null);
        setSelectedDayTodos([]);
    };

    // Function to navigate to next month
    const nextMonth = () => {
        setCurrentDate(prevDate => addMonths(prevDate, 1));
        setSelectedDay(null);
        setSelectedDayTodos([]);
    };

    // Function to return to current month
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDay(null);
        setSelectedDayTodos([]);
    };

    // Generate calendar days when month changes
    useEffect(() => {
        const firstDay = startOfMonth(currentDate);
        const lastDay = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: firstDay, end: lastDay });
        setCalendarDays(days);
    }, [currentDate]);

    // Organize todos by date for the calendar view
    useEffect(() => {
        const todoMap = {};
        todoItems.forEach(todo => {
            if (todo.dueDate) {
                const dateStr = format(parseISO(todo.dueDate), 'yyyy-MM-dd');
                if (!todoMap[dateStr]) {
                    todoMap[dateStr] = [];
                }
                todoMap[dateStr].push(todo);
            }
        });
        setTodosByDate(todoMap);

        // Update selected day todos if a day is selected
        if (selectedDay) {
            const dateStr = format(selectedDay, 'yyyy-MM-dd');
            setSelectedDayTodos(todoMap[dateStr] || []);
        }
    }, [todoItems, selectedDay]);

    // Get the number of todos due on a specific date
    const getTodosForDay = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return todosByDate[dateStr] || [];
    };

    // Get class names for calendar day
    const getDayClasses = (day) => {
        let classes = "h-12 w-12 rounded-full flex items-center justify-center cursor-pointer ";
        
        // Check if the day is from the current month
        if (!isSameMonth(day, currentDate)) {
            classes += "text-gray-400 ";
        } else {
            classes += "text-bodyText ";
        }
        
        // Check if the day is today
        if (isSameDay(day, new Date())) {
            classes += "bg-buttonGeneric/20 font-bold ";
        }

        // Check if the day is selected
        if (selectedDay && isSameDay(day, selectedDay)) {
            classes += "bg-buttonGeneric text-buttonText font-bold ";
        }
        
        return classes;
    };

    // Handle clicking on a day in the calendar
    const handleDayClick = (day) => {
        if (isSameDay(day, selectedDay)) {
            // If clicking the same day, deselect it
            setSelectedDay(null);
            setSelectedDayTodos([]);
        } else {
            setSelectedDay(day);
            const dateStr = format(day, 'yyyy-MM-dd');
            setSelectedDayTodos(todosByDate[dateStr] || []);
        }
    };

    // Count todos with due dates
    const todosWithDueDate = Object.values(todosByDate).flat().length;
    const totalTodos = todoItems.length;

    return (
        <div>
            <div className="bg-itemCardBg p-6 rounded-lg shadow-md mb-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={goToToday}
                            className="px-3 py-1 bg-buttonGeneric text-buttonText rounded-md text-sm"
                        >
                            Today
                        </button>
                        <button 
                            onClick={previousMonth} 
                            className="p-2 rounded-full hover:bg-buttonGeneric/10"
                        >
                            <FaChevronLeft />
                        </button>
                        <button 
                            onClick={nextMonth} 
                            className="p-2 rounded-full hover:bg-buttonGeneric/10"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                {/* Information notice - less highlighted, matching theme */}
                <div className="mb-4 flex items-start space-x-2 text-bodyText p-4 border-l-4 border-red-500">
                    <FaInfoCircle className="mt-1 flex-shrink-0 text-buttonGeneric" />
                    <div className="text-sm">
                        <p>Calendar view only shows todos with due dates ({todosWithDueDate} of {totalTodos} todos).</p>
                        <div className="mt-2 flex items-center">
                            <span className="mr-2">To see all todos, switch to</span>
                            <button 
                                onClick={onSwitchToList}
                                className="flex items-center bg-buttonGeneric text-buttonText px-3 py-1 rounded-md space-x-1 text-sm"
                            >
                                <BsListUl size={14} />
                                <span>List View</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2 text-center font-medium text-bodyText">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Fill in empty spots before the first day of the month */}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, index) => (
                        <div key={`empty-start-${index}`} className="h-24 p-1"></div>
                    ))}

                    {/* Calendar days - adding cursor pointer */}
                    {calendarDays.map((day, index) => {
                        const todosForDay = getTodosForDay(day);
                        return (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.01 }}
                                className={`h-24 border hover:bg-bodyBg/20 rounded-md p-1 relative cursor-pointer ${
                                    selectedDay && isSameDay(day, selectedDay) ? 'border-buttonGeneric bg-bodyBg/10' : 'border-cardBorder'
                                }`}
                                onClick={() => handleDayClick(day)}
                            >
                                <div className={getDayClasses(day)}>
                                    {format(day, 'd')}
                                </div>
                                
                                {todosForDay.length > 0 && (
                                    <div className="absolute top-1 right-1">
                                        <FaCircle 
                                            size={8} 
                                            className={todosForDay.some(t => !t.completed) ? "text-red-500" : "text-green-500"} 
                                        />
                                    </div>
                                )}
                                
                                <div className="mt-1 overflow-hidden">
                                    {todosForDay.length > 0 && (
                                        <div className="text-xs text-center">
                                            {todosForDay.length} task{todosForDay.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Fill in empty spots after the last day of the month */}
                    {Array.from({ length: 6 - new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDay() }).map((_, index) => (
                        <div key={`empty-end-${index}`} className="h-24 p-1"></div>
                    ))}
                </div>
            </div>

            {/* Display todos for selected day */}
            {selectedDay && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Tasks for {format(selectedDay, 'MMMM d, yyyy')}
                        </h3>
                        <button 
                            onClick={() => { setSelectedDay(null); setSelectedDayTodos([]); }}
                            className="text-sm bg-buttonGeneric/20 text-bodyText px-3 py-1 rounded-md"
                        >
                            Hide
                        </button>
                    </div>
                    
                    {selectedDayTodos.length > 0 ? (
                        <motion.div 
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {selectedDayTodos.map((todo, index) => (
                                <motion.div 
                                    key={`${todo.id}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <SingleTodoItem todo={todo} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-6 bg-bodyBg/20 rounded-md">
                            No tasks due on this day
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

TodoCalendarView.propTypes = {
    todoItems: PropTypes.array.isRequired,
    onSwitchToList: PropTypes.func.isRequired
};

export default TodoCalendarView;