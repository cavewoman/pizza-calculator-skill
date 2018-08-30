/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require("ask-sdk-core");

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "LaunchRequest" ||
      (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
        handlerInput.requestEnvelope.request.intent.name ===
          "GetRemoteDataIntent")
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";

    await getRemoteData("http://api.open-notify.org/astros.json")
      .then(response => {
        const data = JSON.parse(response);
        outputSpeech = `There are currently ${
          data.people.length
        } astronauts in space. `;
        for (let i = 0; i < data.people.length; i++) {
          if (i === 0) {
            //first record
            outputSpeech =
              outputSpeech + "Their names are: " + data.people[i].name + ", ";
          } else if (i === data.people.length - 1) {
            //last record
            outputSpeech = outputSpeech + "and " + data.people[i].name + ".";
          } else {
            //middle record(s)
            outputSpeech = outputSpeech + data.people[i].name + ", ";
          }
        }
      })
      .catch(err => {
        //set an optional error message here
        //outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .withStandardCard(
        "Welcome To Pizza Calculator!",
        "Ask what I can do if you need help.",
        "https://s3.amazonaws.com/pizza-calculator-skill/images/small-pizza-3.png",
        "https://s3.amazonaws.com/pizza-calculator-skill/images/large-pizza-3.png"
      )
      .getResponse();
  }
};

const HowManyPizzasHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "HowManyPizzasIntent"
    );
  },
  async handle(handlerInput) {
    const people =
      handlerInput.requestEnvelope.request.intent.slots.numberOfPeople.value;
    const slices = people * 2;
    const pizzas = Math.ceil(slices / 8);
    const outputSpeech = `You should order ${pizzas} pizzas for ${people} people`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .withStandardCard(
        "You should order...",
        `${pizzas} pizzas for ${people} people.`,
        "https://s3.amazonaws.com/pizza-calculator-skill/images/small-pizza-1.png",
        "https://s3.amazonaws.com/pizza-calculator-skill/images/large-pizza-1.png"
      )
      .getResponse();
  }
};

const IntroHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  async handle(handlerInput) {
    let outputSpeech =
      "Welcome To Pizza Calculator! To calculate your pizzas say, Alexa, ask Pizza Calculator how many pizzas should i order for 13 people. Where 13 is the number of people you want a calculation for.";

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .withStandardCard(
        "Welcome To Pizza Calculator!",
        "Ask what I can do if you need help.",
        "https://s3.amazonaws.com/pizza-calculator-skill/images/small-pizza-3.png",
        "https://s3.amazonaws.com/pizza-calculator-skill/images/large-pizza-3.png"
      )
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "You can introduce yourself by telling me your name";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};

const getRemoteData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    IntroHandler,
    HowManyPizzasHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
