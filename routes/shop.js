const express = require('express');

//const path = require('path');

const shopController = require('../controllers/shop');
const isAuth = require('../guards/is-auth').isAuth;

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart/delete-item", isAuth, shopController.getRemoveFromCart);



router.get("/orders", isAuth, shopController.getOrders);

router.get("/checkout", isAuth, shopController.getCheckout);

module.exports = router;
