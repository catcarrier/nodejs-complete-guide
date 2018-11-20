const express = require('express');
const path = require('path');
const { body } = require('express-validator/check');
const adminController = require('../controllers/admin');
const isAuth = require('../guards/is-auth').isAuth;

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', isAuth, [
    body('title')
        .trim()
        .isLength({ min: 1 }).withMessage('Title is required.'),
    body('imageUrl')
        .trim()
        .isURL().withMessage('Image URL must be in url format'),
    body('price')
        .isLength({ min: 1 }).withMessage('Price is required.')
        .isNumeric().withMessage('Price must be a number'),
    body('description', 'Description is required')
        .trim()
        .isLength({ min: 1 })
], adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, [
    body('title')
        .trim()
        .isLength({ min: 3 }).withMessage('Title is required, minimum three characters'),
    body('imageUrl')
        .trim()
        .isURL().withMessage('Image URL must be in url format'),
    body('price', 'Price must be a number')
        //.isLength({ min: 1 }).withMessage('Price is required - at least one digit.')
        .isNumeric().withMessage('Price must be a number'),
    body('description', 'Description is required. minimum five characters')
        .trim()
        .isLength({ min: 5 })
], adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get('/products', isAuth, adminController.getAllProducts);

module.exports = router;