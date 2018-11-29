const User = require('../models/UserModel.js');
const CONFIG = require('../config.js');
const JWT = require('jsonwebtoken');


module.exports = [
  {
      method: 'POST',
      path: '/api/user',
      handler: function (request, h) {
        var o = request.payload;

        console.log('check user for existance', o);

        return User.findOne({'name': o.name}).then(result => {
            console.log('check user result', result);
            if (result) {
                return h.response({'status': 'error',
                    'message': 'user already exist',
                    'user': result})
                    .code(409);
            }

            console.log('creating user', o);

            var user = new User({
                name: o.name,
                password: o.password
            });
        
            return user.save().then(result => {
                console.log('create user result:', result);
                return h.response({'status': 'success', 'user': result});
            });  
    
        });

      }
  },

  {
    method: 'POST',
    path: '/api/login',
    handler: function (request, h) {
      var o = request.payload;

      console.log('logging user', o);

      return User.findOne({'name': o.name}).then(result => {
          console.log('logging user found', result);
          if (!result) {
              console.log('user not exist', o);
              return h.response({'status': 'error', 'message': 'user not exist'}).code(404);
          }

          if (result.password != o.password) {
            console.log(`user password not match '${o.password}' not equal '${result.password}'`)
            return h.response({'status': 'error', 'message': 'password not match'}).code(401);
          }

          var token = JWT.sign({ 'sub': 'todo_access',
                          'iat': Math.floor(Date.now() / 1000),
                          'username': o.name},
              CONFIG.JWT_SECRET,
              { algorithm: CONFIG.JWT_ALGORITHM });

          console.log('user credentials OK');
          return h.response({'status': 'success', 'user': result, 'token': token});
  
      });

    }
}


];