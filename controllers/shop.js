const Product = require('../models/product');

//const mongo = require('mongodb');

exports.getProducts = (req, res, next) => {
    Product.find()
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
    Product.findById(productId)
        .then(
            product => {
                console.log(product);
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
    Product.find()
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
    // req.user.cart.items.productId is an ObjectId. By populating it,
    // we replace its hex value with a copy of the matching product.
    // The product will have the properties not in the cart -- for 
    // example title and description
    // 
    // To expose those properties to the view, iterate over the
    // objects in the new items array and return a new object,
    // pulling down the product properties from under 'productId'.
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const newItems = user.cart.items.map(i => {
                return {
                    _id: i._id,
                    productId: i.productId._id,
                    quantity: i.quantity,
                    title: i.productId.title, /* <-- pull down*/
                    price: i.productId.price, 
                    description: i.productId.description,
                    imageUrl: i.productId.imageUrl
                }
            })
            return newItems;
        })
        .then(enrichedItems => {
            return res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: enrichedItems
            });
        })
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
    Product.findById(prodId)
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
    const productId = req.body.productId;
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
    req.user.getOrders()
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