const Product = require('../models/product');
const { validationResult } = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add a Product",
        buttonLabel: "Add this product",
        path: "/admin/add-product",
        product: {
            title: '',
            imageUrl: '',
            description: '',
            price: ''
        },
        errorMessage: null,
        errors: [],
        editing: false
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file; // multer transforms req.body.<fileControl> --> req.file
    const description = req.body.description;
    const price = Number.parseFloat(req.body.price);

    // If the user did not attach a file or if the file was declined (see 
    // multer config in app.js) then image will be undefined
    if(!image) {
        return res.status(422).render('admin/edit-product', {
            path: '/add-product',
            pageTitle: 'Add Product',
            errorMessage: 'No file attached, or attached file not supported',
            errors: [],
            product: {
                title: title,
                description: description,
                price: price
            },
            editing: false /* product not saved yet, so adding, not editing */
        })
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            path: '/add-product',
            pageTitle: 'Add Product',
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),
            product: {
                title: title,
                description: description,
                price: price
            },
            editing: false /* product not saved yet, so adding, not editing */
        })
    }

    // multer saved the file to this location
    const imageUrl = image.path;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    });
    product.save()
        .then(result => {
            return res.redirect('/')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(err);
        });
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
                errorMessage: '',
                errors: [],
                editing: editMode
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(err);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    //const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = Number.parseFloat(req.body.price);

    // If this is undefined, then no file was attached to the post.
    // In this case keep the existing file.
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            path: '/edit-product',
            pageTitle: 'Edit Product - ' + updatedTitle,
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),
            product: {
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                _id: productId
            },
            editing: true
        })
    }

    Product.findById(productId)
        .then(product => {
            // Did the current user create this product?
            if (product.userId.toString() != req.user._id.toString()) {

                // TODO return to user with error message
                console.log('User is not allowed to update this product');
                return res.redirect('/');
            }

            // otherwise update the product and save
            product.title = updatedTitle;
            product.imageUrl = image ? image.path : product.imageUrl;
            product.price = updatedPrice;
            product.description = updatedDescription;
            return product.save()
                .then(result => {
                    return res.redirect('/admin/products');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(err);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productId;

    // Allow the delete only if the current user created this product
    Product.deleteOne({ _id: id, userId: req.user._id })
        .then(() => {
            return res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(err);
        })
}

exports.getAllProducts = (req, res, next) => {

    Product
        .find({ userId: req.user._id }) // only products created by the current user
        //.select('title price -_id')
        //.populate('userId', 'cart name')
        //.execPopulate()
        .exec()
        .then(products => {
            return res.render('admin/products', {
                pageTitle: "Admin Products",
                path: "/admin/products",
                prods: products
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(err);
        })
};