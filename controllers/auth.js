const crypto = require('crypto');
const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const api_key = require('../api/sendgrid.api').api_key;

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: api_key
    }
}));

exports.getLogin = (req, res, next) => {

    let message = req.flash('errorMessage');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/login', {
        path: 'login',
        pageTitle: 'Login',
        errorMessage: message,
        userInputs: {
            email: "",
            password: ""
        },
        errors: []
    })
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    // If the route handler's validation found any problem...
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Log in',
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),
            userInputs: {
                email: email,
                password: password
            },
        })
    }

    User.findOne({ email: email })
        .then(user => {
            // Note that we are not checking whether the user exists here.
            // We assume that the route handler for .post(/login) has
            // already validated that, and bailed if any error was reported.
            // See the if-block above.
            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save((err) => {
                            if (err) { console.log(err) }
                            return res.redirect('/');
                        });
                    } else {
                        return res.status(422).render('auth/login', {
                            pageTitle: "Log in",
                            path: '/login',
                            userInputs: {
                                email: email,
                                password: password
                            },
                            errorMessage: "Invalid username or password.",
                            errors: [{ param: "email" }, { param: "password" }]
                        })
                    }
                })
                .catch(err => {
                    console.log('compare error: ', err);
                    return res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) { console.log(err) }
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {

    let message = req.flash('errorMessage');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    // dummy values so ejs will not choke
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        userInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        errors: []
    })
}

exports.postSignup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            userInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            errors: errors.array()
        })
    }

    bcrypt.hash(password, 12)
        .then(hash => {
            const newUser = new User({
                email: email,
                password: hash,
                cart: { items: [] }
            });
            return newUser.save();
        })
        .then((result) => {
            // redirect first, then send mail
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'shop@node-complete.us',
                subject: 'Signup successful',
                html: '<h1>Your signup was successful</h1>'
            })
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('errorMessage');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) => {
    // Generate an expiring token to be sent in email, and save the token
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        // Store the token on the User object, where the User is the one
        // matching the email in the submitted form
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('errorMessage', 'email not found.');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'shop@node-complete.us',
                    subject: 'Password reset',
                    html: `
                    <p>You requested a password reset.</p>
                    <p>Click <a href="http://localhost:3000/reset/${token}">here</a> to set a new password.</p>
                    `
                })
            })
            .catch(err => {
                console.log(err);
            })
    })
}

exports.getNewPassword = (req, res, next) => {

    // User has opened the password-reset email. The url includes a token
    // representing the user whose password we will reset.
    // Check that there is a user matching this reset token, where the token
    // expiration is in the future
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {

            // TODO if there is no matching user

            let message = req.flash('errorMessage');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }

            // The reset token is passed in here via url param, but
            // we put it in a hidden field on the reset form we now
            // show to the user.
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })

        })
        .catch(err => {
            console.log(err)
        })
}

/**
 * The user is submitting the password-reset form.
 * The body contains:
 * -- userId representing the user whose password is being reset.
 * -- The password reset token for that user.
 */
exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const confirmNewPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let updatedUser;

    // confirm passwords not empty 
    if (newPassword.length < 1 || confirmNewPassword.length < 1) {
        req.flash('errorMessage', 'Type the new password in both fields');
        return res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: userId
        })
    }

    // confirm passwords match
    if (newPassword != confirmNewPassword) {
        req.flash('errorMessage', 'Type the new password in both fields - make sure they match');
        return res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: userId
        })
    }

    // Check that a user exists matching this user and reset token,
    // and that the token is not expired
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {

            if (!user) {
                throw "User not found!";
            }
            updatedUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            updatedUser.password = hashedPassword;
            updatedUser.resetToken = undefined;
            updatedUser.resetTokenExpiration = undefined;
            return updatedUser.save();
        })
        .then(result => {
            return res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        })
}