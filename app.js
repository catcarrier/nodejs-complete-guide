const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const notFoundRoutes = require('./routes/404');
//const mongoConnect = require('./util/database_mongo').mongoConnect;
const bodyParser = require('body-parser');
// const User = require('./models/user');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
//app.set('views','views'); // the default, ok to omit

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Insert a user into the request, to simulate an authenticated user.
// TODO back this out when adding authentication
// app.use( (req, res, next) => {
//     User.findById("5beb8feeb37097168acc95a3")
//         .then( user => {
//             // mongo just gives us an object containing the objectid, name etc. 
//             // We need a User object instead so we can invoke methods.

//             // console.log("cart is ", user.cart);
//             // console.log( user.cart.items[0].productId instanceof require('mongodb').ObjectId );

            

//             req.user = new User(user.name, user.email, user.cart || null, user._id);
//             //console.log(req.user);
//             next();
//         } )
//         .catch( err => {
//             console.log(err);
//             next();
//         });

// } )

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(notFoundRoutes);

mongoose.connect('mongodb://localhost:27017/shop')
    .then( (result) => {
        app.listen(3000);
    })
    .catch( err => {
        console.log(err);
    })