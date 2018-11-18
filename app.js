const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const notFoundRoutes = require('./routes/404');
const bodyParser = require('body-parser');
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const app = express();
const MONGDB_URI = 'mongodb://localhost:27017/shop';
const sessionStore = new mongodbStore({
    uri: MONGDB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
//app.set('views','views'); // the default, ok to omit

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "someone set us up the bomb",
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

// sessionStore does not know about Mongoose, so the session.user object,
// even if it exists (that is, session has not been destroyed), is not an
// instance of the User class, so we cannot call methods or get the cart etc.
// Here we rebuild the User object via the User class, starting from the
// session.user._id.
app.use((req, res, next) => {

    // If the user is not logged in, do nothing
    if (!req.session.user /* this is just the mongo row, not a User object */) {
        return next();
    }

    // req.sesson.user is not a User object, it's just the row returned from mongo.
    // We need a User object, attached to the request, to call methods on.
    User.findById(req.session.user._id)
        .exec()
        .then(user => {
            req.user = user;
            return next();
        })
        .catch(err => {
            console.log(err);
            return next();
        });

})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(notFoundRoutes);

mongoose.connect(MONGDB_URI)
    .then((result) => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })