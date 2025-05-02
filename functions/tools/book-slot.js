/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
const axios = require('axios');

exports.handler = async function (context, event, callback) {  
    const start = Date.now();    
    const credentials = Buffer.from(`${context.WRITE_KEY}:`).toString('base64');    
    const base = require('airtable').base(context['AIRTABLE_BASE']);  
    const {chosen_slot_id, chosen_date, chosen_time, doctor, customer_name} = event;    
    const [, phone] = event.request.headers["x-identity"]?.split(":");
    console.log("Chosen Date:", chosen_date);
    console.log("Chosen Time:", chosen_time);
    console.log("Doctor:", doctor);
    console.log("Customer Name:", customer_name);
    console.log("Customer Phone:", phone);

    //Update booking in Airtable base.
    try {
        await base('appointments').update([
          {
              "id": chosen_slot_id,
              "fields": {
                  "booked": "Y",
                  "patient_name": customer_name,
                  "patient_phone": phone
              }
          }
      ]);
    } catch (error) {
      console.error('Error updating airtable record:', error);
      return callback(error, null);
    }

    const data = JSON.stringify({
      "userId": phone,
      "event": "Appointment Scheduled",
      "properties": {
        "doctor": doctor,
        "next_appointment_date": `${chosen_date} ${chosen_time} hrs`
      }
    });

    const config = {
      method: 'post',
      url: 'https://api.segment.io/v1/track',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      data
    };
    try {
       const response = await axios.request(config);
       if (!response.data.success) {
          return callback(`Error writing event to Segment`);
       }
    } catch (error) {
      console.error('Error writing event to Segment:', error);
      return callback(error, null);
    }
            
    console.log(`Time elapsed: ${Date.now() - start} ms`);
    return callback(null, "Appointment booked successfully");
  };
  