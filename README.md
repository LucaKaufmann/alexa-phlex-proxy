# Phlex on Alexa

To use this skill you need to have [Phlex](https://github.com/d8ahazard/Phlex) set up, either hosted locally or using the web version at [app.phlexchat.com](https://app.phlexchat.com/).

Once that is done, you'll be ready to set up this skill.

# Endpoint

This repository containts code for the endpoint used by the Alexa skill. It's meant to be hosted on AWS Lambda, but with some minor tweaks it might be able to get it running locally as well.

## Setup

Start by cloning this repository.
Run ```npm install``` to install the required dependencies.

Create a new file called secrets.js with the following content
```javascript
module.exports = Object.freeze({
  PHLEX_URL: 'http://url.to.phlex/api.php?say&apiToken=',
  PHLEX_TOKEN: 'YOUR-PHLEX-TOKEN'
});
```

You'll be able to find the token in the settings of your Phlex installation.

## Deploying

The easiest way to set up and deploy this to Lambda is using Claudia.js. Follow the [instructions here to set it up](https://claudiajs.com/tutorials/installing.html).

To create the Skill on Lambda, run ```claudia create --region eu-west-1 --handler skill.handler --version skill```

This will create a new project on Lambda, set the required rules and permissions and automatically deploy to Lambda.

To allow Alexa to trigger your function, run ```claudia allow-alexa-skill-trigger --version skill```.

You will get a JSON output that looks something like this:
```JSON
{
  "Sid": "Alexa-1234567890123",
  "Effect": "Allow",
  "Principal": {
    "Service": "alexa-appkit.amazon.com"
  },
  "Action": "lambda:InvokeFunction",
  "Resource": "arn:aws:lambda:eu-west-1:123456789012:function:alexa-skill-medium:skill"
}
```

We're only interested in the resource part, which we'll need when setting up the Alexa skill.

One last thing that needs to be done is logging in to your lambda console. Go to the skills page and scroll down to the *Basic Settings*. Set the Timeout to about 10 seconds, which should be enough for Phlex.

In case you make any changes to the code, run ```claudia update``` to deploy a new version.

# Alexa skill

Go to the [Alexa Skills Kit](https://developer.amazon.com/alexa-skills-kit) to get started.
Create a new skill, enter the skill name and choose custom.
Once your skill is created, follow the builders checklist you see on the right.

First, set the invocation name to something that makes sense (media center, Flex TV etc.).

Next we'll set up the actual skill and intents. I included an [example in this repository](alexa-skill-example.json).
Scroll down to JSON Editor, paste it in there and save and then the basics should be set up. You will have to tweak the values of the *playerName* slot type.

Click on it under *Slot Types* and then add the names of your chromecast players. The names need to match the ones in Phlex, so if you're unsure go back to Phlex, click on the Chromecast icon and see what players are available.

You'll also be able to set up synonyms for each player, for example for your living room tv you can set living room or TV.
Now save and then click *Build model*. This will take a few minutes, but go ahead and scroll down to *Endpoint* on the left, choose *AWS Lambda* and paste the lambda resource link from earlier. You'll also be able to see that lambda link on your Lambda console in the top right.

Now save the endpoint and once the build is done click on *Test*.
Enable testing of this skill and then use the Alexa simulator to run a command. For example "ask media center to play the movie Cars in the living room".
After a few seconds, Alexa should reply with the text returned from Phlex and the movie should start playing.

# Logs and Debugging

Lambda makes debugging quite easy. You'll need to set up Test events by clicking *Configure Test events* in the top right. Choose create a new test event and set a name for it.
JSON. Now save and click test. The event should immediately be triggered and either finish successfully or fail.
Click on logs or on Monitoring > View logs in CloudWatch to get to the logs section. From there you should be able to debug your skill. Add additional console.log() statements in the code for more log output.
Remember to run ```claudia update``` after.
