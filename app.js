const express = require('express');
const path = require('path');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const app = express();

// use express-handlebars
app.engine('hbs', expressHbs());
app.set('view engine', 'hbs');
app.set('views', 'views');

// use pug
//app.set('view engine', 'pug'); // pug registers itself with express
//app.set('views', 'views'); // the default, ok to omit if views are under /views



app.use( bodyParser.urlencoded({extended:false}) );
app.use( express.static( path.join( __dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use( (req,res,next) => {
    //res.status(404).sendFile( path.join(__dirname, 'views', '404.html') );
    res.status(404).render('404', {pageTitle:"Not Found", message:"Not Finded."}); // pug view
} );

app.listen(3000);

