import { useEffect, useRef, useState } from 'react';
import check from '../assets/icon-check.svg';
import {
  Droppable,
  Draggable,
  OnDragEndResponder,
  DragDropContext,
} from 'react-beautiful-dnd';
import { User } from '../App';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_TODO, GET_USER_TODOS, UPDATE_TODO } from '../apollo';

export type Todo = {
  owner: string;
  text: string;
  id: number;
  completed: boolean;
};

const todoItems: Todo[] = [];

const TodoList = ({ initTodos, user }: { initTodos?: Todo[]; user: User }) => {
  const [todos, setTodos] = useState(initTodos ?? todoItems);
  const [active, setActive] = useState<0 | 1 | 2>(0);
  const [todoText, setTodoText] = useState('');
  const [todo, setTodo] = useState<Todo>();
  const inputRef = useRef<HTMLInputElement>();

  const [addTodo, { loading: adding, data: newTodo, error: todoError }] =
    useMutation(CREATE_TODO, {
      variables: {
        data: { userId: user.id, text: todoText, completed: false },
      },
    });
  const [updateTodo, { loading: updating }] = useMutation(UPDATE_TODO, {
    variables: {
      updateTodoId: todo?.id,
      data: { completed: !todo?.completed },
    },
  });

  const { data, refetch, loading } = useQuery(GET_USER_TODOS, {
    variables: { userId: user.id },
  });

  useEffect(() => {
    if (!data) return;
    setTodos(data.todosByUser);
  }, [data]);

  useEffect(() => {
    if (!newTodo) return;
    if (newTodo.createTodo) {
      refetch();
      if (inputRef.current) inputRef.current.value = '';
    } else {
      alert('Something went wrong!');
    }
  }, [newTodo, refetch]);

  useEffect(() => {
    if (todoError) {
      alert(todoError.message);
    }
  }, [todoError]);

  const handleCreateTodo = () => {
    if (user && todoText.trim()) {
      addTodo();
    }
  };

  const toggleTodo = (id: number) => {
    setTodo(todos.find((t) => t.id === id));
    updateTodo().then(() => refetch());
  };

  const handleDrop: OnDragEndResponder = (result) => {
    if (!result.destination) return;
    const newTodos = todos.filter((t) => t);
    const src = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, src[0]);

    setTodos(newTodos);
  };

  return (
    <>
      <div className="mt-10 flex gap-2 mb-5 bg-white dark:bg-[#24273d] w-full text-lg px-4 rounded shadow">
        <label htmlFor="check-0" className="check-label">
          <input checked={false} readOnly id="check-0" type="checkbox" />
          <span className="border border-gray-300 inline-block rounded-full h-5 w-5 ">
            <img src={check} alt="Check" />
          </span>
        </label>
        <input
          type="text"
          autoFocus
          ref={inputRef as any}
          disabled={adding}
          onKeyUp={(e) => e.key === 'Enter' && handleCreateTodo()}
          onChange={(e) => setTodoText(e.currentTarget.value)}
          placeholder={adding ? 'Loading...' : 'Add todo...'}
          className="py-3 outline-none w-full flex-1 dark:bg-[#24273d] dark:text-white"
        />
      </div>

      <DragDropContext onDragEnd={handleDrop}>
        <Droppable
          direction="vertical"
          ignoreContainerClipping={false}
          droppableId="droppable"
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className=""
              id="droppable"
            >
              <div className="flex flex-col my-5 rounded-md dark:bg-[#181824] bg-gray-300 overflow-hidden shadow-lg w-full ">
                <div className="h-8 flex gap-2 w-full">
                  {loading || updating ? (
                    <span className="w-4 h-4 m-2 rounded-full border-dotted border-[3px] border-b-0 border-l-0 animate-spin" />
                  ) : (
                    <span className="text-sm p-2 text-gray-500 dark:text-gray-400">
                      {todos.length} todo(s)
                    </span>
                  )}
                  <span className='text-sm p-2 text-gray-500 cursor-pointer dark:text-gray-400 hover:text-white' tabIndex={0} onClick={() => refetch()}>
                    Refresh
                  </span>
                </div>
                {todos
                  .filter(
                    (t) =>
                      active === 0 ||
                      (active === 1 && !t.completed) ||
                      (active === 2 && t.completed)
                  )
                  .map((todo, i) => (
                    <Draggable
                      key={todo.id}
                      index={i}
                      disableInteractiveElementBlocking={true}
                      draggableId={`${todo.id}`}
                    >
                      {(provided, snap) => (
                        <div
                          style={snap.isDragging ? { top: '30px' } : {}}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          id={`${todo.id}`}
                          onClick={() => toggleTodo(todo.id)}
                          className="flex items-center gap-3 border-b p-2 pr-4 dark:border-b-gray-500 bg-white dark:bg-[#24273d] dark:text-white"
                        >
                          <label
                            htmlFor={`check-x-${todo.id}`}
                            className="check-label"
                          >
                            <input
                              // defaultChecked={todo.completed}
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                              id={`check-x-${todo.id}`}
                              type="checkbox"
                            />
                            <span className="border border-gray-300 inline-block rounded-full h-5 w-5 ">
                              <img src={check} alt="Check" />
                            </span>
                          </label>
                          <p
                            className={`text-gray-700/80 dark:text-gray-100 ${
                              todo.completed
                                ? ' line-through text-gray-700/60 dark:text-gray-300/70 '
                                : ''
                            }`}
                          >
                            {todo.text}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
                <div className="flex items-center justify-between gap-3 dark:text-gray-100 dark:bg-[#24273d] border-b dark:border-b-gray-500 py-4 px-4 bg-white">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {todos.filter((t) => !t.completed).length} items left
                  </span>
                  <div className="flex text-sm items-center gap-3 text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => setActive(0)}
                      className={`${
                        active === 0
                          ? 'text-blue-500'
                          : 'hover:text-gray-800 dark:hover:text-gray-100'
                      } `}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActive(1)}
                      className={`${
                        active === 1
                          ? 'text-blue-500'
                          : 'hover:text-gray-800 dark:hover:text-gray-100'
                      } `}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setActive(2)}
                      className={`${
                        active === 2
                          ? 'text-blue-500'
                          : 'hover:text-gray-800 dark:hover:text-gray-100'
                      } `}
                    >
                      Completed
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      setTodos((td) => td.filter((t) => !t.completed))
                    }
                    className="text-gray-500 hover:text-gray-800 text-sm dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    Clear Completed
                  </button>
                </div>
              </div>
              <p className="text-center mt-10  text-sm text-gray-400">
                Drag and drop to reorder list
              </p>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

// export const Todo = ({ i, todo }: { i: number; todo: Todo }) => (

// );

export default TodoList;
