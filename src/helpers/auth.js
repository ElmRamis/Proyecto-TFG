const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'You need to sign in to view this page');
    res.redirect('/users/signin');
};

helpers.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.email === 'ADMIN@OPW.es') {
        return next();
    }
    req.flash('error_msg', 'Not Authorized as Admin');
    res.redirect('/users/signin');
};

module.exports = helpers;
