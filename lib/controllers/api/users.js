module.exports = function(parameters) {
  var app = parameters.app;
  app.protect.get('/duffel-auth/users/current', 'login', function(req, res){
    res.json({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });
  });
};
