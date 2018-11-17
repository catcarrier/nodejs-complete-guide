const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const notFoundRoutes = require('./routes/404');
//const mongoConnect = require('./util/database_mongo').mongoConnect;
const bodyParser = require('body-parser');
const User = require('./models/user');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
//app.set('views','views'); // the default, ok to omit

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Insert a user into the request, to simulate an authenticated user.
// TODO back this out when adding authentication
app.use( (req, res, next) => {
    User.findById("5beb8feeb37097168acc95a3")
        .exec()
        .then( user => {
            //console.log(user)
            req.user = user;
            next();
        } )
        .catch( err => {
            console.log(err);
            next();
        });
} )

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(notFoundRoutes);

mongoose.connect('mongodb://localhost:27017/shop')
    .then( (result) => {

        // a mocked-up user for testing
        // const user = new User({
        //     name:"Bill",
        //     email:"bill@test.com",
        //     cart: []
        // });
        // user.save();

        app.listen(3000);
    })
    .catch( err => {
        console.log(err);
    })