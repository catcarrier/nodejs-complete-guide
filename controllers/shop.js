const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(
            products => {
                res.render('shop/product-list', {
                    prods: products,
                    pageTitle: 'All Products',
                    path: '/products',
                    isAuthenticated: req.session.isLoggedIn
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
                return res.render('shop/product-detail', {
                    product: product,
                    pageTitle: product.title,
                    path: '/products',
                    isAuthenticated: req.session.isLoggedIn
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
                path: '/',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log(err);
        })
};

exports.getCart = (req, res, next) => {
    // user.cart.items.productId is an ObjectId. By populating it,
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
                products: enrichedItems,
                isAuthenticated: req.session.isLoggedIn
            });
        })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
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
    if (req.user.cart.items.length < 1) {
        return res.redirect('/cart');
    }

    // Get the items in the user's cart,
    // fill in the product details via the Product model.
    // This replaces each order item's productId with a copy
    // of the Product from the Product collection.
    //
    // Before: user.cart.items[ { productId: <ObjectId> } ]
    // After:  user.cart.items[ { productId: <Product> } ]
    //
    // 
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            // Flatten the model by transforming each order item
            // to pull the various product properties down one level
            const newItems = user.cart.items.map(item => {
                return {
                    productId: item.productId,
                    title: item.productId.title,
                    description: item.productId.description,
                    price: item.productId.price,
                    imageUrl: item.productId.imageUrl,
                    quantity: item.quantity
                }
            });
            return newItems;
        })
        .then(items => {
            const order = new Order({
                user: { userId: req.user._id },
                items: items
            });
            return order;
        })
        .then(order => {
            return order.save();
        })
        .then(result => {
            return req.user.clearCart()
        })
        .then(result => {
            return res.redirect('/orders')
        })
        .catch(err => {
            console.log(err);
            res.redirect('/cart');
        })
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .exec()
        .then(orders => {
            px = [];
            for (var i = 0; i < orders.length; i++) {
                px.push(orders[i].populate('items.productId').execPopulate());
            }
            return Promise.all(px).then(result => { return orders });
        })
        .then(orders => {
            // Make a mutable copy of each order so we can clean up a bit
            let newOrders = [];
            for (var i = 0; i < orders.length; i++) { newOrders.push(orders[i].toObject()) }

            // pull the Product properties down from under .productId
            for (var i = 0; i < newOrders.length; i++) {
                let order = newOrders[i];

                order.items = order.items.map(item => {
                    return {
                        productId: item.productId._id,
                        title: item.productId.title,
                        price: item.productId.price,
                        description: item.productId.description,
                        imageUrl: item.productId.imageUrl,
                        quantity: item.quantity
                    }
                });
            }
            return newOrders;
        })
        .then(orders => {
            return res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/');
        });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        isAuthenticated: req.session.isLoggedIn
    });
};