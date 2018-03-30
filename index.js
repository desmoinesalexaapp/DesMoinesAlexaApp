/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

AWS.config.update({
  region: "us-east-2"
});
//testing
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function (event, context) {
    const handlers = {
        'LaunchRequest': function () {
            this.emit(':tell', 'Launching already');
        },
        'GetLocationIntent': function () {
            let intent = this;
            
            if(event.request.intent.slots.firstName.value && event.request.intent.slots.lastName.value){
                let fName = '';
                let lName = '';
                console.log(event.request.intent.slots.firstName.value + ' ' + event.request.intent.slots.lastName.value)
                
                if(event.request.intent.slots.firstName.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH'){
                    console.log(event.request.intent.slots.firstName.resolutions.resolutionsPerAuthority[0]);
                    fName = event.request.intent.slots.firstName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                }else{
                    fName = event.request.intent.slots.firstName.value;
                }
                
                if(event.request.intent.slots.lastName.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH'){
                    console.log(event.request.intent.slots.lastName.resolutions.resolutionsPerAuthority[0]);
                    lName = event.request.intent.slots.lastName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                }else{
                    lName = event.request.intent.slots.lastName.value;
                }
                
                const params = {
                    Key: {
                       "Email": {
                         S: (fName + '.' + lName + '@us.sogeti.com').toLowerCase()
                        },
                    }, 
                    TableName: 'SogetiATO',
                }
                console.log('starting query for ',  params.Key.Email.S);
                dynamodb.getItem(params, function(err, data) {
                    if(err){
                        console.log('err: ', err);
                        intent.emit(':tell', 'there was an error');
                    }else{
                        console.log('data: ', data);
                        let output = data.Item ? data.Item.Location.S : 'Could not find ' + fName + ' ' + lName;
                        intent.emit(':tell', output);
                    }
                });   
            }else{
                intent.emit(':tell', 'Missing first or last name');
            }
        },
        'GetTimeIntent': function () {
            let intent = this;
            
            if(event.request.intent.slots.firstName.value && event.request.intent.slots.lastName.value){
                let fName = '';
                let lName = '';
                console.log(event.request.intent.slots.firstName.value + ' ' + event.request.intent.slots.lastName.value)
                
                if(event.request.intent.slots.firstName.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH'){
                    console.log(event.request.intent.slots.firstName.resolutions.resolutionsPerAuthority[0]);
                    fName = event.request.intent.slots.firstName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                }else{
                    fName = event.request.intent.slots.firstName.value;
                }
                
                if(event.request.intent.slots.lastName.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH'){
                    console.log(event.request.intent.slots.lastName.resolutions.resolutionsPerAuthority[0]);
                    lName = event.request.intent.slots.lastName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                }else{
                    lName = event.request.intent.slots.lastName.value;
                }
                const params = {
                    Key: {
                       "Email": {
                         S: (fName + '.' + lName + '@us.sogeti.com').toLowerCase()
                        },
                    }, 
                    TableName: 'SogetiATO',
                }
                
                const name = fName + ' ' + lName;
                
                console.log('starting query for ',  params.Key.Email.S);
                dynamodb.getItem(params, function(err, data) {
                    console.log('inside query');
                    if(err){
                        console.log('err: ', err);
                        intent.emit(':tell', 'there was an error');
                    }else{
                        console.log('data: ', data);
                        
                        if(!data.Item){
                            intent.emit(':tell', 'Could not find ' + name);
                        }else{
                            const availDate = Date.parse(data.Item.AvailabilityDate.S);
                            const currentDate = new Date();
                            let timeUntilAvail = availDate - currentDate;
                            timeUntilAvail = timeUntilAvail / 86400000; //24 * 60 * 60 * 1000
                            timeUntilAvail = Math.floor(timeUntilAvail); //round down
                            console.log('Time until available: ', timeUntilAvail);
                            if(timeUntilAvail < 0){
                                intent.emit(':tell', name + ' is already at the office');
                            }else if(timeUntilAvail == 0){
                                intent.emit(':tell', name + ' comes off their project today');
                            }else{
                                intent.emit(':tell', name + ' will be available in ' + timeUntilAvail + ' days');
                            }
                        }
                    }
                });
            }
            //console.log('params: ', params);
            //this.emit(':tell', 'test success');
        },
        'AMAZON.HelpIntent': function () {
            this.emit(':tell', 'no help for you');
        },
        'AMAZON.CancelIntent': function () {
            this.emit(':tell', 'Cancelling ok');
        },
        'AMAZON.StopIntent': function () {
            this.emit(':tell', 'Stopping ok');
        },
    };
    
    const alexa = Alexa.handler(event, context);
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
