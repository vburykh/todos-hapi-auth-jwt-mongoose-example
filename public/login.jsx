/*
 * Redux message types
 */
const MESSAGE = 'MESSAGE';

const CHANGE_USERNAME = 'CHANGE_USERNAME';
const CHANGE_PASSWORD = 'CHANGE_PASSWORD';
const LOGIN = 'LOGIN';

const CHANGE_REG_USERNAME = 'CHANGE_REG_USERNAME';
const CHANGE_REG_PASSWORD = 'CHANGE_REG_PASSWORD';
const REGISTER = 'REGISTER';

/*
 * React Components
 */
const Message = ({ msg }) => {
  return (<div>Message: {msg}</div>);
};


const Login = ({ login, onLogin }) => {
  return (
  <div>
    <input type='text' placeholder='Username' value={login.username} onChange={event =>
      dispatch({ type: CHANGE_USERNAME, value: event.target.value })
    }/>
    <input type='text' placeholder='Password' value={login.password} onChange={event =>
      dispatch({ type: CHANGE_PASSWORD, value: event.target.value })
    }/>
    <input type='button' value='Login' onClick={onLogin}/>
  </div>
  )
};

const Register = ({ register, onRegister }) => {
  return (
  <div>
    <input type='text' placeholder='Username' value={register.username} onChange={event =>
      dispatch({ type: CHANGE_REG_USERNAME, value: event.target.value })
    }/>
    <input type='text' placeholder='Password' value={register.password} onChange={event =>
      dispatch({ type: CHANGE_REG_PASSWORD, value: event.target.value })
    }/>
    <input type='button' value='Register' onClick={onRegister}/>
  </div>
  )
};

const LoginApp = ({ dispatch, login, register, message }) => { 
  return (
    <div>
      <Message msg={message} />
      <Login login={login} onLogin={onLogin} />
      <Register register={register} onRegister={onRegister} />
    </div>
  );
};

/*
 * Login action
 */
const onLogin = () => {
  let apiReply;
  var u = store.getState().login.username;
  var p = store.getState().login.password;

  showMessage('logging user: ' + u);  

  return fetch('/api/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'  
    },
    body: JSON.stringify({'name': u, 'password': p})
  }).then(result => {
    apiReply = result;
    console.log("logging user api reply: ", apiReply);
    return apiReply.json();
  }).then(data => {
    if (data.status === 'success') {
      if (!data.token) {
        return 'not received auth token, failed';
      }

      localStorage.setItem('todo_token', data.token);

      dispatch({type: LOGIN});
      return 'successfully logged in!'
    }
    return 'error: ' + apiReply.status + ' ' + data.message || data.JSON.stringify(apiReply);
  }).then(msg => {
    return showMessage('logging user result: ' + msg);
  });

};

/*
 * Register action
 */
const onRegister = () => {
  let apiReply;
  var u = store.getState().register.username;
  var p = store.getState().register.password;

  if (!u || !p) {
    return showMessage('please fill username and password')
  }

  showMessage('registering user: ' + u);  

  return fetch('/api/user', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'  
    },
    body: JSON.stringify({'name': u, 'password': p})
  }).then(result => {
    apiReply = result;
    console.log("registering user api reply: ", apiReply);
    return apiReply.json();
  }).then(data => {
    if (data.status === 'success') {
      dispatch({type: REGISTER});
      dispatch({type: CHANGE_USERNAME, value: u})
      dispatch({type: CHANGE_PASSWORD, value: p})
      return 'successfully registered!'
    }
    return 'error: ' + apiReply.status + ' ' + data.message || data.JSON.stringify(apiReply);
  }).then(msg => {
    return showMessage('registering user result: ' + msg);
  });

};

/*
 * status message functions
 */
const showMessage = (message) => dispatch({type: MESSAGE, message: message});
const clearMessage = () => dispatch({type: MESSAGE, message: ''});

/*
 * Redux reducers
 */
const login = (state = {'username': '', 'password': ''}, action) => {
  switch (action.type) {
  case LOGIN:
    window.location.href = '/todos.html';
    return Object.assign(state, {});
  case CHANGE_USERNAME:
    return Object.assign(state, { 'username': action.value });
  case CHANGE_PASSWORD:
    return Object.assign(state, { 'password': action.value });

  default:
      return state;
  }
}

const register = (state = {'username': '', 'password': ''}, action) => {
  switch (action.type) {
  case REGISTER:
    return Object.assign(state, { 'username': '', 'password': '' });
  case CHANGE_REG_USERNAME:
    return Object.assign(state, { 'username': action.value });
  case CHANGE_REG_PASSWORD:
    return Object.assign(state, { 'password': action.value });

  default:
      return state;
  }
}

const message = (state = 'Please, login or register', action) => {
  switch (action.type) {
    case MESSAGE:
      return action.message;
    default:
      return state;
  }
}

const appReducer = Redux.combineReducers({login, register, message});
const store = Redux.createStore(appReducer);

const dispatch = (action) => {
  store.dispatch(action);
};

const render = () => {
  ReactDOM.render(
    <LoginApp {...store.getState()} dispatch={dispatch} />,
    document.getElementById('root')
  );
}

render();
store.subscribe(render);