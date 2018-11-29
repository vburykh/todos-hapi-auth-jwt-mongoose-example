/*
 * Redux message types
 */
const USER_MESSAGE = 'USER_MESSAGE';
const FETCH_TODOS = 'FETCH_TODOS';
const ADD_TODO = 'ADD_TODO';
const CHANGE_TODO = 'CHANGE_TODO';
const DELETE_TODO = 'DELETE_TODO';
const UPDATE_TODO = 'UPDATE_TODO';
const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

/*
 * filter types for todos list
 */
const Filters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};


/*
 * React Components
 */
class AddTodo extends React.Component {
  render() {
    return (
      <div>
        <input type='text' ref='input4add' />
        <input type='button' onClick={(e) => this.handleClick(e)} value="Add todo" />
      </div>
    );
  }

  handleClick(e) {
    const node = this.refs.input4add;
    const text = node.value.trim();
    this.props.onAddClick(text);
    node.value = '';
  }
}

const FilterLink = ({ isActive, name, onClick }) => {
  if (isActive) {
    return <span>{name}</span>;
  }

  return (
    <a href='#' onClick={e => { e.preventDefault(); onClick(); }}>
      {name}
    </a>
  );  
};

const Header = ({ msg }) => {
  return (<div>Message: {msg}</div>);
};

const Footer = ({ filter, onFilterChange }) => (
  <p>
    Show:
    {' '}
    <FilterLink
      name='All'
      isActive={filter === Filters.SHOW_ALL}
      onClick={() => onFilterChange(Filters.SHOW_ALL)} />
    {', '}
    <FilterLink
      name='Completed'
      isActive={filter === Filters.SHOW_COMPLETED}
      onClick={() => onFilterChange(Filters.SHOW_COMPLETED)} />
    {', '}
    <FilterLink
      name='Active'
      isActive={filter === Filters.SHOW_ACTIVE}
      onClick={() => onFilterChange(Filters.SHOW_ACTIVE)} />
  </p>
);

const Todo = (props) => (
  <div>
    <input type='text' value={props.text} onChange={props.onChange}/>
    <input type='button' value={props.completed ? 'Activate' : 'Complete'} onClick={props.onComplete}/>
    <input type='button' value='Update' onClick={props.onUpdate}/>
    <input type='button' value='Delete' onClick={props.onDelete}/>
  </div>
);


class TodoList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    return fetchTodos();
  }

  render() {
    return(<div>
      {this.props.todos.map(todo =>
        <Todo {...todo}
              key={todo.id}
              apiId={todo.id}
              text={todo.text}
              completed={todo.completed}
              onChange={(event) => this.props.onTodoChange(todo.id, event)}
              onDelete = {() => deleteTodo({todo})}
              onUpdate = {() => updateTodo({todo})}
              onComplete={() => completeTodo({todo})} />
      )}
    </div>);
  }
};

/*
 * React root element
 */
const TodoApp = ({ dispatch, todos, visibilityFilter, userMessage }) => {
  let visibleTodos = todos;

  switch (visibilityFilter) {
  case Filters.SHOW_COMPLETED:
    visibleTodos = todos.filter(todo => todo.completed);
    break;
  case Filters.SHOW_ACTIVE:
    visibleTodos = todos.filter(todo => !todo.completed);
  break;
  }
  
  return (
    <div>
      <Header msg={userMessage} />
      <AddTodo onAddClick={text => addTodo(text)} />
      <TodoList
        todos={visibleTodos}
        onTodoChange={ (id, event) =>
          dispatch({ type: CHANGE_TODO, id, value: event.target.value })
        } />
      <Footer
        filter={visibilityFilter}
        onFilterChange={filter =>
          dispatch({ type: SET_VISIBILITY_FILTER, filter })
        } />
    </div>
  );
};

/*
 * status message functions
 */
const showMessage = (message) => dispatch({type: USER_MESSAGE, message: message});
const clearMessage = () => dispatch({type: USER_MESSAGE, message: ''});

/*
 * http header to appear in all API requests
 */
const prepareApiHeaders = () => {
  var h = { 'Accept': 'application/json', 'Content-Type': 'application/json' };

  const token = localStorage.getItem('todo_token');
  if (!token) {
    return null;
  }
  
  h['Authorization'] = 'Bearer ' + token;
  return h;
};

/*
 * redirect to login page
 */
const showLoginPage = () => {
  alert('Authorization problem, will be redirected to login page');
  window.location.href = '/login.html';
  return null;    
};

/*
 * API calls
 */
const completeTodo = (o) => {
  o.todo.completed = !o.todo.completed;
  return updateTodo(o);
};

const updateTodo = (o) => {
  let apiReply;
  let todo = o.todo;

  const headers = prepareApiHeaders();
  if (!headers) {
    return showLoginPage();
  }

  console.log("updating ", todo);
  showMessage('updating todo: ' + JSON.stringify(todo));

  return fetch('/api/todo', { method: 'PUT',
    headers: headers,
    body: JSON.stringify(todo)
  }).then(result => {
    apiReply = result;
    console.log("update todo api reply: ", apiReply);
    return apiReply.json()
  }).then(data => {
    if (data.id === todo.id) {
      dispatch({ type: UPDATE_TODO, text: data.text, id: data.id, completed: data.completed });
      return 'success';
    }
    return 'error: ' + apiReply.statusText || JSON.stringify(apiReply);
  }).then(msg => {
    return showMessage('update result: ' + msg);
  });

};

const deleteTodo = (o) => {
  let apiReply;
  let todo = o.todo;

  const headers = prepareApiHeaders();
  if (!headers) {
    return showLoginPage();
  }

  console.log("deleting ", todo);
  showMessage('deleting todo: ' + JSON.stringify(todo));

  return fetch('/api/todo', {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify(todo)
  }).then(result => {
    apiReply = result;
    console.log("delete todo api reply: ", apiReply);
    return apiReply.json()
  }).then(data => {
    if (data.id === todo.id) {
      dispatch({ type: DELETE_TODO, id: data.id});
      return 'success';
    }
    return 'error: ' + apiReply.statusText || JSON.stringify(apiReply);
  }).then(msg => {
    return showMessage('delete result: ' + msg);
  });

};

const addTodo = (text) => {
  let apiReply;
  showMessage('adding todo: ' + text);  

  const headers = prepareApiHeaders();
  if (!headers) {
    return showLoginPage();
  }

  return fetch('/api/todo', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({text: text, completed: false})
  }).then(result => {
    apiReply = result;
    console.log("add todo api reply: ", apiReply);
    return apiReply.json();
  }).then(data => {
    if (data.id) {
      dispatch({ type: ADD_TODO, text: data.text, id: data.id, user: data.user });
      return 'success';
    }
    return 'error: ' + apiReply.statusText || JSON.stringify(apiReply);
  }).then(msg => {
    return showMessage('add result: ' + msg);
  });
};

const fetchTodos = () => {
  let apiReply;
  showMessage('fetching user todos');
  
  const headers = prepareApiHeaders();
  if (!headers) {
    return showLoginPage();
  }

  return fetch('/api/todos', {
    method: 'GET',
    headers: headers    
  }).then(result => {
    apiReply = result;
    console.log("fetch todo api reply: ", apiReply);
    return apiReply.json();
  }).then(data => {
    if (data instanceof Array) {
      dispatch({ type: FETCH_TODOS, todos: data });
      return 'success ' + data.length;
    }
    return 'error: ' + apiReply.statusText || JSON.stringify(apiReply);
  }).then(msg => {
    return showMessage('fetch result: ' + msg);
  });
};


/*
 * Redux reducers
 */
const visibilityFilter = (state = Filters.SHOW_ALL, action) => {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return action.filter;
  default:
    return state;
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
  case FETCH_TODOS:
    return [...action.todos];
  case ADD_TODO:
    return [{
      text: action.text,
      id: action.id,
      completed: false
    }, ...state];

  case UPDATE_TODO:
    return state.map(todo =>
      todo.id === action.id ? Object.assign({}, todo, { text: action.text, completed: action.completed } ) : todo
    );

  case DELETE_TODO:
    let idx = -1;
    for (var i = 0; i < state.length; i++) {
      if (action.id === state[i].id) {
        idx = i;
        break;
      }
    }

    idx != -1 && state.splice(idx,1);
    return state;
    
  case CHANGE_TODO:
    return state.map(todo =>
      todo.id === action.id ? Object.assign({}, todo, { text: action.value } ) : todo
    );
  default:
      return state;
  }
}

const userMessage = (state = 'initializing... ', action) => {
  switch (action.type) {
  case USER_MESSAGE:
    return action.message;
  default:
    return state;
  }
}

const todoApp = Redux.combineReducers({
  visibilityFilter,
  todos,
  userMessage
});

const store = Redux.createStore(todoApp);

const dispatch = (action) => {
  store.dispatch(action);
};

const render = () => {
  ReactDOM.render(
    <TodoApp
      {...store.getState()}
      dispatch={dispatch}
    />,
    document.getElementById('root')
  );
}

render();
store.subscribe(render);
