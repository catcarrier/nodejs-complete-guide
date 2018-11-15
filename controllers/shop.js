const Product = require('../models/product');
const Cart = require('../models/cart');
const mongo = require('mongodb');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(
            products => {
                res.render('shop/product-list', {
                    prods: products,
                    pageTitle: 'All Products',
                    path: '/products'
                });
            }
        )
        .catch(err => {
            console.log(err);
        })
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.getProductById(productId)
        .then(
            product => {
                return res.render('shop/product-detail', {
                    product: product,
                    pageTitle: product.title,
                    path: '/products'
                });
            }
        )
        .catch(err => {
            console.log(err);
        })
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            console.log(err);
        })
};

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(products => {
            //console.log(products);
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            });

        })
        .catch(err => {
            console.log(err);
        })

    // Cart.getCart(cart => {
    //     Product.fetchAll(products => {
    //         // For each product that is also in the cart, return a hybrid object
    //         // combining the product (from Product) with the quantity (from Cart)
    //         const cartProducts = [];
    //         for (product of products) {
    //             const cartProductData = cart.products.find(p => p.id === product.id);
    //             if (cartProductData) {
    //                 cartProducts.push({
    //                     productData: product,
    //                     quantity: cartProductData.quantity
    //                 });
    //             };
    //         }
    //         res.render('shop/cart', {
    //             pageTitle: 'Your Cart',
    //             path: '/cart',
    //             products: cartProducts
    //         });
    //     })

    // });
};

// exports.getAddToCart = (req, res, next) => {
//     const productId = req.body.productId;
//     //const productPrice = Number.parseFloat(req.body.productPrice);
//     Cart.addProduct(productId)
//         .then( () => {
//             return res.redirect('/cart');
//         })
//         .catch( (err) => {
//             console.log(err);
//         })
// };

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.getProductById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        // .then( result => {
        //     console.log(result);
        // } )
        .then(() => {
            return res.redirect('/cart');
        })
        .catch((err) => {
            console.log(err);
        })
};

exports.getRemoveFromCart = (req, res, next) => {
    const productId = new mongo.ObjectId(req.body.productId);
    req.user.removeFromCart(productId)
        .then(result => {
            return res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
        })
};

exports.postOrder = (req, res, next) => {
    req.user
        .addOrder()
        .then(result => {
            return res.redirect('/orders');
        })
        .catch(err => {
            console.log(err);
        });
}


exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => {
            console.log(err)
        });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};