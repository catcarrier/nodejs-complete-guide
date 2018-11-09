const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    });

};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    const product = Product.getProductById(productId, product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    });
};


exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            // For each product that is also in the cart, return a hybrid object
            // combining the product (from Product) with the quantity (from Cart)
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(p => p.id === product.id);
                if (cartProductData) {
                    cartProducts.push({
                        productData: product,
                        quantity: cartProductData.quantity
                    });
                };
            }
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });
        })

    });
};

exports.getAddToCart = (req, res, next) => {
    const productId = req.body.productId;
    const productPrice = Number.parseFloat(req.body.productPrice);
    Cart.addProduct(productId, productPrice);
    res.redirect('/cart');
};

exports.getRemoveFromCart = (req, res, next) => {
    const productId = req.body.productId;

    // need product price for cart total price adjustment
    const product = Product.getProductById(productId, product => {
        const productPrice = product.price;
        Cart.deleteProduct(productId, productPrice);
        return res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
};


exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};
