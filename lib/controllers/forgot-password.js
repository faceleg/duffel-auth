var redirect = require('../functions/redirect'),
  User = require('../models/User').model(),
  Token = require('../models/Token').model(),
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
      email: req.body.email,
      status: 'Active'
    }, function(error, user) {
      if (error) throw error;
      if (!user) {
        return res.end();
      }
      var token = new Token({
        user_id: user._id,
        type: 'password-reset'
      });
      token.save(function(error, token) {
        if (error) {
          return res.end();
        }
        var tmpl = (app.get('nunjucksEnvironment')).getTemplate('email/forgot-password.html');
        var email = app.get('mailer');
        email.send({
          to: user.name + '<' + user.email + '>',
          subject: 'Winners Bible password reset request',
          html: tmpl.render({
            rootUrl: app.get('rootUrl'),
            title: 'Winners Bible Password Reset',
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
      user = User.findById(token.user_id, function(error, user) {
        if (error) {
          res.status(404);
          return res.render('errors/404.html');
        }
        user.confirmed = true;
        user.save(function(error) {
          if (error) {
            res.status(500);
            return res.render('errors/500.html');
          }
          //token.used = true;
          //token.save(function(error) {
          //  if (error) {
          //    res.status(500);
          //    return res.render('errors/500.html');
          //  }
            res.render('reset-password.html', {
               user: user
            });
          //});
        });
      });
    });

  })
}
