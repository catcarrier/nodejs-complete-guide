const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const api_key = require('../api/sendgrid.api');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: ap_key
    }
}))


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
        errorMessage: message
    })
}


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {

                // Becuase we are redirecting, a new req/res will be created, and
                // there is no way to put an error msg onto the user's page.
                // This middleware inserts a msg into the session that persists until used.
                // See getLogin().
                req.flash('errorMessage', 'invalid email or password.');
                return res.redirect('/login');
            }

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
                        req.flash('errorMessage', 'Invalid username or password');
                        return res.redirect('/login');
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

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (email.length < 1) {
        req.flash('errorMessage', 'Email is required.');
        return res.redirect('/signup');
    }

    if (password.length == 0 || confirmPassword.length == 0) {
        req.flash('errorMessage', 'Type a non-blank value for password');
        return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
        req.flash('errorMessage', 'Passwords must match');
        return res.redirect('/signup')
    }

    // Is there a user matching this email?
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (user) {
                req.flash('errorMessage', 'Email already in use.');
                return res.redirect('/signup');
            }

            return bcrypt.hash(password, 12)
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
        })
        .catch(err => {
            console.log(err);
        });
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
            // it will be in a hidden field on the reset form
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

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const confirmNewPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    // confirm passwords not empty 
    if( newPassword.length<1 || confirmNewPassword.length < 1 ) {
        req.flash('errorMessage','Type the new password in both fields');
        return res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: userId
        })
    }

    // confirm passwords match
    if(newPassword != confirmNewPassword) {
        req.flash('errorMessage','Type the new password in both fields - make sure they match');
        return res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: userId
        })
    }

    // TODO confirm the user exists




}