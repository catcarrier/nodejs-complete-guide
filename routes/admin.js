const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const router = express.Router();

const products = [];

router.get('/add-product', (req,res,next) => {
    //res.sendFile( path.join(rootDir, 'views', 'add-product.html') );
    res.render('add-product', {
        pageTitle: "Add a Product", 
        buttonLabel:"Add this product", 
        path: "/admin/add-product",
        formsCSS : true,
        activeAddProduct : true
    })
});

router.post('/add-product', (req,res,next) => {
    products.push({title:req.body.title});
    res.redirect('/');
});

module.exports.routes = router;
module.exports.products = products;