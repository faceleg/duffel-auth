var redirect = require('../functions/redirect'),
  User = require('../models/User').model(),
  Token = require('duffel-token').Token();

module.exports = function(parameters) {
  var app = parameters.app;

  app.get('/forgot-password', function(req, res){
    if (req.user) {
      return res.redirect(redirect(req, app));
    }
    res.render('/duffel-auth/forgot-password.html');
  });

  app.post('/forgot-password', function(req, res) {
    User.findOne({
      email: req.body.email,
      status: 'Active'
    }, function(error, user) {
      if (error) throw error;
      if (!user) {
        return res.end();
      }
      var token = new Token({
        payload: user._id,
        type: 'password-reset'
      });
      token.save(function(error, token) {
        if (error) {
          return res.end();
        }
        var email = app.get('mailer');
        email.send({
          to: user.name + '<' + user.email + '>',
          subject: 'Winner\'s Bible password reset request',
          html: app.get('nunjucksEnvironment').render('/duffel-auth/email/forgot-password.html', {
            rootUrl: app.get('rootUrl'),
            title: 'Winner\'s Bible Password Reset',
            headline: 'Registration Password Reset',
            user: user,
            token: token
          })
        }, function(error) {
          if (error) {
            res.status(500);
            return res.send();
          }
          res.status(200);
          res.send();
        });
      });
    });
  });

  app.get('/forgot-password/reset/:token', function(req, res) {
    Token.getValid(req.params.token, 'password-reset', function(error, token, reason) {
      if (error) {
        res.status(404);
        return res.render('errors/404.html');
      }
      user = User.findById(token.payload, function(error, user) {
        if (error || user.status != 'Active') {
          res.status(404);
          return res.render('errors/404.html');
        }
        user.confirmed = true;
        user.save(function(error) {
          if (error) throw error;
          res.render('/duffel-auth/reset-password.html', {
            user: user
          });
        })
      });
    });
  });

  app.post('/forgot-password/reset/:token', function(req, res) {
    Token.getValid(req.params.token, 'password-reset', function(error, token, reason) {
      if (error) throw error;
      user = User.findById(token.payload, function(error, user) {
        if (error) {
          res.status(404);
          return res.render('errors/404.html');
        }
        token.used = true;
        token.save(function(error) {
          if (error) {
            res.status(500);
            return res.render('errors/500.html');
          }
          if (req.body.password != req.body.repeatPassword) {
            return res.status(400);
          }
          user.password = req.body.password;
          user.save(function(error) {
            if (error) {
              res.status(400);
              return res.json({
                error: {
                  errors: error.errors
                }
              });
            }
            req.flash('success', 'Your password has been reset');
            res.send();
          });
        });
      });
    });
  });
}
