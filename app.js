const express = require('express');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodyParser = require('body-parser');

const app = express();

app.use( bodyParser.urlencoded({extended:false}) );

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use( (req,res,next) => {
    res.status(404).send("<html><h1>Page not found</h1></html>");
} );

app.listen(3000);

