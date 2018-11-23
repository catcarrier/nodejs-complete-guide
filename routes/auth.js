const express = require('express');
const { body } = require('express-validator/check'); /* use { check } to check headers, params, cookies etc not just body */
const User = require('../models/user');
const isAuth = require('../guards/is-auth').isAuth;
const shopController = require('../controllers/shop');


const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('email is not valid')
            .trim()
            .normalizeEmail()
            .custom(value => {
                return User.findOne({ email: value })
                    .exec()
                    .then(user => {
                        if (!user) { return Promise.reject('No user matching that email. Someone I know?'); }
                    })
            }),
        body('password', 'password must be at least 4 chars in length')
            .isLength({ min: 4 })
            .trim()     
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [
        body('email')
            .isEmail().withMessage('email is invalid')
            .normalizeEmail()
            .custom(value => {
                return User.findOne({ email: value })
                    .exec()
                    .then(user => {
                        if (user) { return Promise.reject('Email is already in use.'); }
                    })
            }),
        body('password', 'password must be at least 4 chars in length')
            .trim()
            .isLength({ min: 4 }),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) { throw new Error('Password must match Confirm Password') };
                return true;
            })
    ],
    authController.postSignup);

router.get('/reset', authController.getReset); // user opens password-reset page

router.post('/reset', authController.postReset); // user submits password-reset page, requesting a reset for email x

router.get('/reset/:token', authController.getNewPassword); // user opens the password-reset email

router.post('/new-password', authController.postNewPassword); // user submits new password

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
