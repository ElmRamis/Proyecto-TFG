// index.js
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const vipUser = require('./models/Vip');

// Initializations
const app = express();
require('./database');
require('./config/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.isAdmin = req.user && req.user.email === 'ADMIN@TFG.es';
    res.locals.isVip = req.user && vipUser.includes(req.user.email);
    next();
});

// Routes
const indexRoutes = require('./routes/index');
const notesRoutes = require('./routes/notes');
const usersRoutes = require('./routes/users');
const emailRoutes = require('./routes/email'); 
const noteUsers = require('./routes/noteUsers'); 
app.use('/', indexRoutes);
app.use(notesRoutes);
app.use(usersRoutes);
app.use(emailRoutes);  
app.use(noteUsers);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Server start
app.listen(app.get('port'), () => {
    console.log('Servidor escuchando en el puerto', app.get('port'));
});
