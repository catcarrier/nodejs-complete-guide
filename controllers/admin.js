const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add a Product",
        buttonLabel: "Add this product",
        path: "/admin/add-product",
        editing: false
    })
};

exports.postAddProduct = (req, res, next) => {
    const id = null; /* will be assigned by the model upon insert */
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = Number.parseFloat(req.body.price);

    const product = new Product(
        id,
        title,
        imageUrl,
        description,
        price
    );
    product.save()
        .then(res.redirect('/'))
        .catch(err => console.log(err));

};

exports.getEditProduct = (req, res, next) => {
    // Redirect the user to / if ?edit=true not included the params
    const editMode = req.query.edit;
    if (editMode != 'true') { return res.redirect('/'); }

    const productId = req.params.productId;
    Product.getProductById(productId)
        .then( product => {
            return res.render('admin/edit-product', {
                product: product,
                pageTitle: "Edit " + product.title,
                path: "/admin/edit-product",
                editing: editMode
            })
        } )
        .catch( err => {
            console.log(err);
            return res.redirect('/');
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(productId, title, imageUrl, description, price);
    product.save()
        .then( () => {
            return res.redirect('/admin/products');
        } )
        .catch( err => {
            console.log(err);
            return res.redirect('/admin/products');
        } )
};

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productId;
    Product.removeById(id)
        .then( () => {
            return res.redirect('/admin/products');
        } )
        .catch( err => {
            console.log(err);
            return res.redirect('/admin/products');
        } )
}

exports.getAllProducts = (req, res, next) => {
    Product.fetchAll()
        .then( products => {
            return res.render('admin/products', {
                pageTitle: "Admin Products",
                path: "/admin/products",
                prods: products
            })
        })
        .catch(err => {
            console.log(err);
        })
};