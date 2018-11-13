const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const notFoundRoutes = require('./routes/404');

const mongoConnect = require('./util/database_mongo').mongoConnect;

const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
//app.set('views','views'); // the default, ok to omit

app.use( bodyParser.urlencoded({extended:false}) );
app.use( express.static( path.join( __dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(notFoundRoutes);

mongoConnect( () => {
    app.listen(3000);
})


