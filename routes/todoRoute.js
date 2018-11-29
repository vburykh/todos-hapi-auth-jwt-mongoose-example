const Todo = require('../models/TodoModel.js');
const User = require('../models/UserModel.js');
const CONFIG = require('../config.js');
const JWT = require('jsonwebtoken');

const getUsername = (request) => {
    var token = request.headers.authorization;
    
    if (!token) {
        console.log('no authorization header');
        throw new Error('no authorization header');
    }

    if (token && token.substring(0, 7).toLowerCase() === 'bearer ') {
        token = token.slice(7);
    }

    var decoded = JWT.verify(token, CONFIG.JWT_SECRET, { algorithm: CONFIG.JWT_ALGORITHM });
    console.log('decoded JWT', decoded);

    if (!decoded.username) {
        console.log('no username in JWT');
        throw new Error('no username in JWT');
    }

    return decoded.username;
}

const normalize4App = (elem) => {
    elem.id = elem._id;
    delete elem._id;
    return elem;
}

const objCopy = (o) => {
    return JSON.parse(JSON.stringify(o));
}

module.exports = [
  {
      method: 'POST',
      path: '/api/todo',
      handler: function (request, h) {             
          var o = request.payload;
          var username = getUsername(request);
          
          return User.findOne({'name': username}).then(result => {
            if (!result) {
                console.log('user not exist', username);
                return h.response({'status': 'error', 'message': 'user not exist'}).code(404);
            }

            console.log('creating todo', o, 'for', username);

            var todo = new Todo({
                user: username,
                text: o.text,
                completed: o.completed,
                created: new Date().getTime()
            });

            return todo.save().then(result => {
                var o = objCopy(result);
                o = normalize4App(o);
                console.log('create todo result:', o);
                return h.response(o);
            });          
          });
      }
  },

  {
    method: 'PUT',
    path: '/api/todo',
    handler: function (request, h) {   
        var o = request.payload;

        console.log('updating todo',o);

        return Todo.findById(o.id).then(todo => {
            todo.text = o.text;
            todo.completed = o.completed;
            return todo.save();
        }).then(result => {
            var o = objCopy(result);
            o = normalize4App(o);
            console.log('update todo result:', o);
            return h.response(o); 
        });
    }
  },

  {
    method: 'DELETE',
    path: '/api/todo',
    handler: function (request, h) {   
        var o = request.payload;

        console.log('deleting todo',o);

        return Todo.findById(o.id).then(todo => {
            return todo.remove();
        }).then(result => {
            console.log('delete todo result:', result);
            return h.response({'id': result._id}); 
        });
    }
  },

  {
      method: 'GET',
      path: '/api/todos',
      handler: function (request, h) {
          var username = getUsername(request);
          
          return User.findOne({'name': username}).then(result => {
            if (!result) {
                console.log('user not exist', username);
                return h.response({'status': 'error', 'message': 'user not exist'}).code(404);
            }

            return Todo.find({'user': username}).then(todos => {
                var arr = objCopy(todos);                    
                arr = arr.map(elem => normalize4App(elem));
                arr = arr.sort((a,b) => (a<b?-1:1));
                console.log('found', arr.length, 'todos for', username);
                return h.response(arr);                  
            });
          });
      }
  }

];