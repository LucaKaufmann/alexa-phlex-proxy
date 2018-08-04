'use strict'

const alexaSkillKit = require('alexa-skill-kit')
const AlexaMessageBuilder = require('alexa-message-builder')
const rp = require('request-promise')
const secrets = require('./secrets');

function mediaSkill(event, context, callback) {
  console.log(event)

  alexaSkillKit(event, context, (message) => {
    console.log(message)

    if (message.type === 'LaunchRequest') {
      return new AlexaMessageBuilder()
      .addText('Hello from Plex. You can play movies or series from the Plex server for example: Play Cars on the Living Room TV. What would you like to play?')
      .addRepromptText('What would you like to play?')
      .keepSession()
      .get();
    }

    if (message.type === 'SessionEndedRequest') {
      console.log("Session ended");
      return 'Something went wrong.';
    }

    if (message.intent.name === 'PlayMedia') {
      var input = ''
      var media = ''
      if (message.intent.slots.movie.value) {
        input = slotValue(message.intent.slots.movie, false);
      } else if (message.intent.slots.series.value) {
        input = slotValue(message.intent.slots.series, false);
      } else {
        return 'Unable to find the movie or series on Plex'
      }

      if (input) {
        console.log(input);
        media = input.split(' ').join('+');
      } else {
        return 'Unable to find the movie or series on Plex'
      }

      var playerInput = 'Living Room TV'
      if (message.intent.slots.player.value) {
        playerInput = slotValue(message.intent.slots.player, false)
      }
      var player = playerInput.split(' ').join('+');

      console.log(secrets.PHLEX_URL+secrets.PHLEX_TOKEN+'&command=play+'+media+'+on+'+player);
      var options = {
          uri: secrets.PHLEX_URL+secrets.PHLEX_TOKEN+'&command=play+'+media+'+on+'+player,
          headers: {
              'User-Agent': 'Request-Promise'
          },
          json: true // Automatically parses the JSON string in the response
      };

      return rp(options)
      .then(response => response.speech)
      .catch(function (err) {
          console.log('It failed');
      });
    }

    if (message.intent.name === 'DownloadMedia') {
      var input = ''
      var media = ''
      if (message.intent.slots.newMovie.value) {
        input = slotValue(message.intent.slots.newMovie, false);
      } else if (message.intent.slots.newSeries.value) {
        input = slotValue(message.intent.slots.newSeries, false);
      } else {
        return 'Unable to find the movie or series on Plex'
      }

      if (input) {
        console.log(input);
        media = input.split(' ').join('+');
      } else {
        return 'Unable to find the movie or series on Plex'
      }

      console.log(secrets.PHLEX_URL+secrets.PHLEX_TOKEN+'&command=download+'+media);
      var options = {
          uri: secrets.PHLEX_URL+secrets.PHLEX_TOKEN+'&command=download+'+media,
          headers: {
              'User-Agent': 'Request-Promise'
          },
          json: true // Automatically parses the JSON string in the response
      };

      return rp(options)
      .then(response => response.speech)
      .catch(function (err) {
          console.log('It failed');
      });
    }

    if (message.intent.name == 'AMAZON.CancelIntent') {
      return 'Okay!'
    }


  })
}

function slotValue(slot, useId){
    let value = slot.value;
    let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
    if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
        let resolutionValue = resolution.values[0].value;
        value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
    }
    return value;
}

exports.handler = mediaSkill
