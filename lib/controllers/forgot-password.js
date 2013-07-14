var redirect = require('../functions/redirect'),
  User = require('../models/User').model(),
  email = require('../functions/email');

module.exports = function(parameters) {
  var app = parameters.app;

  app.get('/forgot-password', function(req, res){
    if (req.user) {
      return res.redirect(redirect(req, app));
    }
    res.render('forgot-password.html');
  });

  app.post('/forgot-password', function(req, res) {
    User.findOne({
      email: req.body.user.email,
      status: 'Active'
    }, function(error, user) {
      if (error) throw error;
      if (!user) {
        return res.end();
      }
      email({
        to: req.body.user.email,
        data: {


        }
      });
    });
  });
}
