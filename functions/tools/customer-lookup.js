/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
const axios = require('axios');

exports.handler = async function (context, event, callback) {
    console.log("Start - Customer Lookup");
    const twilioResponse = new Twilio.Response();
    const profileToken = context.PROFILE_TOKEN;
    const spaceID = context.SPACE_ID;
    const baseURL = 'https://profiles.segment.com/v1';
    const credentials = Buffer.from(`${profileToken}:`).toString('base64');
    const config = {
    headers: {
        Authorization: `Basic ${credentials}`
        }
    };
    const [, userId] = event.request.headers["x-identity"]?.split(":");

    const response = await axios.get(
        `${baseURL}/spaces/${spaceID}/collections/users/profiles/user_id:${encodeURIComponent(
          userId
        )}/traits?limit=100`,
        config
      );

    const traits = response.data.traits;
    if (traits) {        
        twilioResponse
        // Set the status code to 200 OK
        .setStatusCode(200)
        // Set the Content-Type Header
        .appendHeader('Content-Type', 'application/json')
        // Set the response body
        .setBody({
            customerProfile: traits
        });
        console.log("End - Customer Lookup");
        return callback(null, twilioResponse);
    }
  };