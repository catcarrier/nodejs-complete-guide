const Product = require('../models/product');
const Order = require('../models/order');
const getPageState = require('../util/pagination');

// TODO move to a shared definition
const ITEMS_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalDocuments;

    Product.countDocuments()
        .then(total => {
            totalItems = total;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(
            products => {
                const pageState = getPageState(page, ITEMS_PER_PAGE, totalItems);
                res.render('shop/product-list', {
                    prods: products,
                    pageTitle: 'All Products',
                    path: '/products',
                    pageState:pageState

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
                    path: '/products'
                });
            }
        )
        .catch(err => {
            console.log(err);
        })
};

exports.getIndex = (req, res, next) => {

    const page = +req.query.page || 1;
    let totalItems;

    Product.countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            const pageState = getPageState(page, ITEMS_PER_PAGE, totalItems);
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                pageState: pageState
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
                products: enrichedItems
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
                orders: orders
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
        path: '/checkout'
    });
};

exports.getInvoice = (req, res, next) => {
    const fs = require('fs');
    const path = require('path');

    const orderId = req.params.orderId;
    const invoiceFilename = orderId + '-invoice.pdf';
    const invoicePath = path.join(__dirname, '../data/invoices/', invoiceFilename);
    const doDownload = req.query.download; // ?download=<truthy> --> send as attachment

    Order.findById({ _id: orderId })
        .then(order => {
            if (!order) {
                return next(new Error('No such order: ' + orderId));
            }

            // TODO move this part to a route guard?
            // Is the current user authorized to read this invoice?
            if (req.user._id.toString() != order.user.userId.toString()) {
                return next(new Error('Not authorized'));
            }

            /**
             * Version 1: reads entire existing file into memory, then sends the content
             */

            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) { 
            //         return next(new Error('Could not locate invoice at ', invoicePath))
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');

            //     // Send as inline unless the query params requested a download
            //     if (doDownload) {
            //         res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceFilename + '"');
            //     } else {
            //         res.setHeader('Content-Disposition', 'inline');
            //     }
            //     res.send(data);
            // });

            /**
             * Version 2 Writes existing file to a stream -- file must already exist
             */

            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // if (doDownload) {
            //     res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceFilename + '"');
            // } else {
            //     res.setHeader('Content-Disposition', 'inline');
            // }
            // file.pipe(res);
            // file.on('end', () => {
            //     file.close( () => {
            //         return;
            //     })
            // })

            /**
             * Version 3 Creates a file using pdfkit, then streams it.
             */

            res.setHeader('Content-Type', 'application/pdf');
            if (doDownload) {
                res.setHeader('Content-Disposition', 'attachment; filename="' + invoicePath + '"');
            } else {
                res.setHeader('Content-Disposition', 'inline');
            }

            const PDFDocument = require('pdfkit');
            let pdf = new PDFDocument();
            pdf.pipe(fs.createWriteStream(invoicePath));
            pdf.pipe(res);
            pdf.fontSize(26).text('Invoice', { underline: true });
            pdf.fontSize(12);
            pdf.text('Order items:').text('\n');  //text("");

            // An aray promises, one per order item
            let px = [];
            let totalPrice = 0;
            for (var i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                let p = Product.findById({ _id: item.productId })
                    .then(product => {
                        pdf.text("Product: " + product.title);
                        pdf.text("Price: $" + product.price);
                        pdf.text('Quantity: ' + item.quantity);
                        pdf.text('----------');

                        totalPrice = + product.price * item.quantity;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                px.push(p);
            }

            // pull in the data for all order items
            Promise.all(px).then(result => {
                pdf.text('\n\n');
                pdf.text('Total Price: $' + totalPrice);
                pdf.end();
            })
                .then(result => {
                    // cleanup - delete the pdf
                    try {
                        console.log('deleting ', invoicePath, '...');
                        require('../util/file').deleteFile(invoicePath);
                    } catch (e) {
                        console.log(ee);
                    }
                })
                .catch(err => {
                    next(new Error(err));
                })
        })

}