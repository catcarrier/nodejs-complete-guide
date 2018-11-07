const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: "Add a Product",
        buttonLabel: "Add this product",
        path: "/admin/add-product",
        formsCSS: true,
        activeAddProduct: true
    })
};

exports.postAddProduct = (req, res, next) => {
    if (req.body.title != '') {
        const product = new Product(req.body.title);
        product.save();
    }
    res.redirect('/');
};

exports.getAllProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('admin/products', {
            pageTitle: "Admin Products",
            path: "/admin/products"
        })
    });
};