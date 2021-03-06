var request = require('request');
var requestPromise = require('request-promise');

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json",
  "secret": process.env.CHOREOGRAPHER_SECRET
};

module.exports = {
  getEventsData: function (req, res, next) {
    // There are events from two different locations: Metronome and Melody.
    // We make a get request to each endpoint. The data coming back from each API is different.
    // We alter the data and combine it into one object before sending back to the client.
    requestPromise({
      method: 'GET',
      uri: process.env.CHOREOGRAPHER_URL + '/metronome/events',
      headers: headers
    })
    .then(function(data){
      var parsedData = JSON.parse(data);
      var text = parsedData;

      //Temporary hack
      //TODO: deprecate
      var abbreviations = {
        M:'Monday',
        T:'Tuesday',
        W:'Wednesday',
        R:'Thursday',
        F:'Friday',
        S:'Saturday',
        break: 'break'
      };
      text = abbreviations;
      // endhack

      var metronomeEvents = parsedData.rhythms.map(function (rhythm) {
        return {
          "eventKey": rhythm[0],
          "text": text[rhythm[0]] || rhythm[0],
          "title": text[rhythm[0]] || rhythm[0],
          "url": rhythm[1],
          "cron": rhythm[2],
          "description": rhythm[3]
        };
      });

      requestPromise({
        method: 'GET',
        uri: process.env.CHOREOGRAPHER_URL + '/melody/calendar',
        headers: headers
      })
      .then(function(data){
        var melodyEvents = JSON.parse(data);
        melodyEvents = melodyEvents.map(function(event){
          return {
            title: event.eventName,
            text: event.eventName,
            eventName: event.eventName,
            eventKey: event.eventName,
            date: event.date,
            description: event.eventName + " - " + event.date,
            cron: null
          }
        })
        var allEvents = metronomeEvents.concat(melodyEvents);
        res.send(allEvents);

      })
    })
  },

  createEvent: function (req, res, next) {
    var event = req.body;
    event.trigger = process.env.CHOREOGRAPHER_URL + '/signal/' + event.title;
    event.interval = event.cron;
    request({
      method: 'POST',
      uri: process.env.CHOREOGRAPHER_URL +  '/metronome/events/' + event.title,
      headers: headers,
      json: event
    }, function (error, response, body) {
      if (error) {
        console.log("Error: ", error);
        res.send(400);
      } else {
        res.status(response.statusCode).send(response.body);
      }
    });
  },

  deleteEvent: function (req, res, next) {
    var eventName = req.params.eventName;
    request({
      method: 'DELETE',
      uri: process.env.CHOREOGRAPHER_URL +  '/metronome/events/' + eventName,
      headers: headers
    }, function (error, response, body) {
      if (error) {
        console.log("Error: ", error);
        res.send(400);
      } else {
        res.send(200);
      }
    });
  }
};
