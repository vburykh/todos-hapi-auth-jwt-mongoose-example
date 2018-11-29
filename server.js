'use strict';

const Hapi = require('hapi');
const todoRoute = require('./routes/todoRoute.js');
const userRoute = require('./routes/userRoute.js');
const Mongoose = require('mongoose');
const CONFIG = require('./config.js');


const server = Hapi.server({
    port: CONFIG.HTTP_PORT
});

//load database
Mongoose.connect(CONFIG.MONGO_URL);
var db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log('Connection with database succeeded.');
});

const init = async () => {
    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                index: ['login.html']
            }
        }
      });

    server.route(todoRoute);

    server.route(userRoute);

    await server.start();

    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
