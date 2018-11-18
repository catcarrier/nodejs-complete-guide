const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add a Product",
        buttonLabel: "Add this product",
        path: "/admin/add-product",
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = Number.parseFloat(req.body.price);

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    });
    product.save()
        .then(res.redirect('/'))
        .catch(err => console.log(err));

};

exports.getEditProduct = (req, res, next) => {
    // Redirect the user to / if ?edit=true not included the params
    const editMode = req.query.edit;
    if (editMode != 'true') { return res.redirect('/'); }

    const productId = req.params.productId;
    Product.findById(productId)
        .exec()
        .then(product => {
            return res.render('admin/edit-product', {
                product: product,
                pageTitle: "Edit " + product.title,
                path: "/admin/edit-product",
                editing: editMode,
                isAuthenticated: req.session.isLoggedin
            })
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/');
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = Number.parseFloat(req.body.price);

    Product.findById(productId)
        .then(product => {
            product.title = updatedTitle;
            product.imageUrl = updatedImageUrl;
            product.price = updatedPrice;
            product.description = updatedDescription;
            return product.save();
        })
        .then(result => {
            return res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/admin/products');
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productId;
    Product.deleteOne({ _id: id })
        .then(() => {
            return res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/admin/products');
        })
}

exports.getAllProducts = (req, res, next) => {

    Product
        .find()
        //.select('title price -_id')
        //.populate('userId', 'cart name')
        //.execPopulate()
        .exec()
        .then(products => {
            return res.render('admin/products', {
                pageTitle: "Admin Products",
                path: "/admin/products",
                prods: products,
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err);
        })
};