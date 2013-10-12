var User = require('../models/user');
// var Auth = require('./middlewares/authorization.js');  

module.exports = function(app,passport){    

  app.get("/", function(req, res){
    console.log(req.isAuthenticated(),"authenticated!")
    if(req.isAuthenticated()){ res.render("home", { user : req.user}); }
    else{ res.render("register"); }
  });

  app.get('/login', function(req,res){
    res.render("login")
  })

  app.post('/login' ,passport.authenticate('local',{
    successRedirect : "/",
    failureRedirect : "/login",
  })
  )

  app.post('/register',function(req,res){
    User.register(req.param('email'),req.param('password'), function(err,user){
      if(err) throw err;
      req.login(user, function(err){
        return res.redirect("/");
      });
    })
  })

  app.get('/logout',function(req,res){
    req.logout()
    res.redirect('/login')
  })
}