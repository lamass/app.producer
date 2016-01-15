var express = require('express');
var passport = require('passport');
var helpers = require('./config/helpers.js');

var templatesController = require('./templates/templatesController.js');
var eventsController = require('./events/eventsController');
var rolesController = require('./roles/rolesController.js');
var proceduresController = require('./procedures/proceduresController.js');
var soundboardController = require('./soundboard/soundboardController.js');

module.exports = function (app) {
  // could be abstracted out into router file
  app.use(express.Router());
  app.use(express.static(__dirname + '/../client'));


  // login with github route
  app.get('/auth/github', passport.authenticate('github'));

  // github OAuth callback url
  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
      res.cookie('session', 'true', { httpOnly: false });
      if(process.env.NODE_ENV === 'dev') {
        res.redirect('/');
      } else {
        res.redirect('/producer/v0/');
      }
  });


  app.get('/logout', function (req, res){
    req.logout();
    res.cookie('session', '');
    res.sendStatus(401);
  });



  // 'verify' is authentication middleware added to all protected routes

  app.post('/templates', verify, templatesController.postTemplate);
  app.get('/roles', verify, rolesController.getRoles);
  app.get('/events', verify, eventsController.getEventsData);
  app.post('/events', verify, eventsController.createEvent);
  app.delete('/events/:eventName', verify, eventsController.deleteEvent);
  app.post('/soundboard/:eventName', verify, soundboardController.postSoundboard);
  app.get('/soundboard/:eventName', verify, soundboardController.getSoundboardTemplate);
  app.get('/procedures', verify, proceduresController.getProcedures);
  app.post('/procedures', verify, proceduresController.createProcedure);
  app.put('/procedures/:procedureId', verify, proceduresController.updateProcedure);
  app.delete('/procedures/:procedureId', verify, proceduresController.deleteProcedure);

  app.get('/commit', helpers.getCommitHash);

  function verify(req, res, next) {
    if (req.isAuthenticated() && req.user) {
     return next();
   }
    if (req.user && req.user.__error) {
      res.cookie('message', req.user.__error);
    } else {
      res.cookie('session', '');
    }
    //Do not redirect here, client will handle redirection to login page;
    res.sendStatus(401);
  }

};