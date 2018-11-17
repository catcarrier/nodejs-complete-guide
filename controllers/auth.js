exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path:'login',
        pageTitle:'Login'
    })
}

exports.postLogin = (req, res, next) => {
    //res.setHeader('Set-Cookie','loggedIn=true; Max-Age=10');
    res.redirect('/');
}