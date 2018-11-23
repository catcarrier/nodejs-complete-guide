exports.get404 = (req,res,next) => {
    res.status(404).render('404', {
        pageTitle:"Not Found",
        message: "Not finded",
        path:''
    });
};

exports.get500 = (req,res,next) => {
    res.status(500).render('500', {
        pageTitle:"An error occurred!",
        message: "An error occurred on the server.",
        path:''
    });
};
