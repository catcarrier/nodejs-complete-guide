const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const fileUtil = require('../util/file'); // fs helper functions

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
    if (!image) {
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
    const updatedImage = req.file; // If this is undefined, then no file was attached to the post.

    // Did the route validation throw any errors?
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
            // TODO use route validation for this.
            if (product.userId.toString() != req.user._id.toString()) {

                // TODO return to user with error message
                console.log('User is not allowed to update this product');
                return res.redirect('/');
            }

            // otherwise update the product with the updated values, and save.

            // First, delete the existing image *if* the user
            // supplied an image with the post. If the user did not
            // supply an image, keep the existing one
            if (updatedImage) {
                try {
                    console.log('removing existing product image ', product.imageUrl);
                    fileUtil.deleteFile(product.imageUrl);
                    console.log('removing existing product image... done');
                } catch (e) {
                    console.log(e);
                }
            }

            product.title = updatedTitle;
            product.imageUrl = updatedImage ? updatedImage.path : product.imageUrl;
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

exports.deleteProduct = (req, res, next) => {
    const id = req.params.productId;
    let imageUrl;

    // Get the path to the product image so we can delete that
    // ater deleting the product.
    // Note that we look up only products created by this user;
    // If the user did not create the product, they cannot delete it.
    Product.findOne({ _id: id, userId: req.user._id })
        .then(product => {
            if (!product) {
                next(new error('Product not found, or you do not have access to modify/delete it.'));
            }
            imageUrl = product.imageUrl;
            fileUtil.deleteFile(imageUrl);
            return Product.deleteOne({ _id: id });
        })
        .then(result => {

            // TODO send json instead of redirect
            //res.redirect('/admin/products')
            res.status(200).json({
                message: "Success"
            });
        })
        .catch(err => {
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // next(err);
            res.status(500).json({
                message: "deleting product failed!"
            });

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