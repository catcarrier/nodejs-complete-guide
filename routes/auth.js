const express = require('express');
const { body } = require('express-validator/check'); /* use { check } to check headers, params, cookies etc not just body */
const User = require('../models/user')

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post(
    '/login',
    [
        body('email')
            .isEmail().withMessage('email is no good - bah!')
            .custom(value => {
                return User.findOne({ email: value })
                    .exec()
                    .then(user => {
                        if (!user) { return Promise.reject('No user matching that email. Someone I know?'); }
                    })
            }),
        body('password', 'password must be at least 4 chars in length')
            .isLength({ min: 4 })        
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [
        body('email')
            .isEmail().withMessage('email is invalid')
            .custom(value => {
                return User.findOne({ email: value })
                    .exec()
                    .then(user => {
                        if (user) { return Promise.reject('Email is already in use.'); }
                    })
            }),
        body('password', 'password must be at least 8 chars in length')
            .isLength({ min: 8 }),
        body('confirmPassword')
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

module.exports = router;