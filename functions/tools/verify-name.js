/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {    
    const name_customer = event.name_provided_by_customer_for_verification;
    const name_profile = event.full_name_from_customer_profile;
    console.log("Full name provided by the customer for verification:", name_customer);
    console.log("Full name from the customer profile:", name_profile);
    if (name_customer === name_profile)
        return callback(null, "Verification Successful");
    else
        return callback(null, "Verification Failed");
  };
  