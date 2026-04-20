let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');

let indexRouter = require('./routes/index');


let swaggerUi = require('swagger-ui-express');
let swaggerJsdoc = require('swagger-jsdoc');
let { Song } = require('./schemas/song.schema');
let { SongRequest } = require('./schemas/songRequest.schema');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de la tienda de música de SDI',
            version: '1.0.0',
            description: 'Documentación interactiva de la API',
        },
        components: {
            schemas: {
                Song,
                SongRequest
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de pruebas de la aplicación',
            },
        ],
    },
    // Esta ruta debe apuntar a donde tengas tus comentarios YAML/JSDoc
    apis: ['./routes/api/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);


let app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

let rest = require('request');
app.set('rest', rest);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token"); // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
let jwt = require('jsonwebtoken');
app.set('jwt', jwt);
let expressSession = require('express-session');
app.use(expressSession({secret: 'abcdefg', resave: true, saveUninitialized: true}));
let crypto = require('crypto');
let fileUpload = require('express-fileupload');
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
    createParentPath: true
}));
app.set('uploadPath', __dirname)
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const userSessionRouter = require('./routes/userSessionRouter');
const userAudiosRouter = require('./routes/userAudiosRouter');
app.use("/songs/add", userSessionRouter);
app.use("/publications", userSessionRouter);
app.use("/songs/buy", userSessionRouter);
app.use("/purchases", userSessionRouter);
app.use("/audios/", userAudiosRouter);
app.use("/shop/", userSessionRouter)
app.use("/songs/favorites", userSessionRouter);

const userAuthorRouter = require('./routes/userAuthorRouter');
app.use("/songs/edit", userAuthorRouter);
app.use("/songs/delete", userAuthorRouter);

const userTokenRouter = require('./routes/userTokenRouter');
app.use("/api/v1.0/songs/", userTokenRouter);
app.use("/api/v1.0/itunes/favorites", userTokenRouter);

const {MongoClient} = require("mongodb");
const connectionStrings = 'mongodb+srv://admin:sdi@musicstoreapp.zhlojqd.mongodb.net/?appName=musicstoreapp';
const dbClient = new MongoClient(connectionStrings);

let songsRepository = require("./repositories/songsRepository.js");
songsRepository.init(app, dbClient);

const favoriteSongsRepository = require("./repositories/favoriteSongsRepository.js");
favoriteSongsRepository.init(app, dbClient);

const usersRepository = require("./repositories/usersRepository.js");
usersRepository.init(app, dbClient);

const itunesRepository = require("./repositories/itunesRepository.js");
itunesRepository.init(app, dbClient);
require("./routes/api/itunesAPI.js")(app, itunesRepository, favoriteSongsRepository);

require("./routes/songs/favorites.js")(app, favoriteSongsRepository, songsRepository)
require("./routes/songs.js")(app, songsRepository);
require("./routes/api/songsAPIv1.0.js")(app, songsRepository, usersRepository);
require("./routes/authors.js")(app, songsRepository);
require("./routes/users.js")(app, usersRepository);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log("Se ha producido un error " + err);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;