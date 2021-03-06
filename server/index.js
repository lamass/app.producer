var server = require('./server.js');

server.phase(function listen (app, next) {
  console.log("I'm in the server phase!");
  app.listen(process.env.PORT);
  next();
});

server(function onReady (error) {
  if (error) {
    throw error;
  }
});
