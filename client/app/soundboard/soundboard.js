angular.module('producer.soundboard', [])

.controller('soundboardController', function ($scope, Events, Soundboard, Messages, Hilighter) {
  //TODO: hacky way to not carry over message
  Messages.clearMessage();
  $scope.events = [];
  $scope.selectedEvent = {};
  $scope.templates = [];

  $scope.getClass = function (event) {
    return Hilighter.hilight(event, $scope.selectedEvent.title);
  };

  $scope.getEvents = function () {
    Events.getEvents().then(function (response) {
      var events = response.data.filter(function(event){return !!event.cron});
      $scope.events = events;
    }).catch(function (error) {
      console.log(error);
    });
  };

  $scope.selectEvent = function (selection) {
    $scope.selectedEvent = selection;
    $scope.selectedEvent.isSelected = true;
    $scope.getTemplate(selection);
  };

  $scope.triggerEvent = function () {
    var event = $scope.selectedEvent;
    Soundboard.triggerEvent(event).then(triggerSuccess, triggerError);
  };

  var triggerSuccess = function(response) {
    Messages.setMessage('You successfully triggered this event. All tasks will be assigned.', 'success');
    $scope.getEvents();
  };

  var triggerError = function(response) {
    if ((400 <= response.status) && (response.status < 500)) {
      Messages.setMessage('Sorry, there was an error with triggering this event. Please try again.', 'error');
    } else {
      Messages.setMessage(response.data, 'error');
    }
  };

  $scope.getTemplate = function (event) {
    Soundboard.getTemplate(event).then(function (res) {
      $scope.templates = Soundboard.formatTemplateData(res.data);
    }).catch(function (error) {
      console.log(error);
    });
  };

  $scope.getEvents();

});
