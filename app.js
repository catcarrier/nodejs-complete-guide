const express = require('express');
const path = require('path');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
//app.set('views','views'); // the default, ok to omit

app.use( bodyParser.urlencoded({extended:false}) );
app.use( express.static( path.join( __dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use( (req,res,next) => {
    res.status(404).render('404', {pageTitle:"Not Found", message:"Not Finded."});
} );

app.listen(3000);

