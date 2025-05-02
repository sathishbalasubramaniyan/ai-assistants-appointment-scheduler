/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  try {
    const start = Date.now();
    const base = require('airtable').base(context['AIRTABLE_BASE']);
    const response = new Twilio.Response();
    const {doctor} = event;
    console.log("Doctor's name:", doctor);

    //Hardcoded slots for ease of testing.
    /*const availableSlots = [
        {
            "date": "07/04/2025",
            "time": "10:00"
        },
        {
            "date": "14/04/2025",
            "time": "15:30"
        },
        {
            "date": "18/04/2025",
            "time": "16:00"
        }
    ]*/

    //Get the slots from Airtable base.
    let records = await base('appointments').select({
        maxRecords: 10,
        filterByFormula: `AND(doctor = '${doctor}',booked = 'N')`
    }).firstPage();
    
    if (records.length === 0) {
      return callback(`Couldn't find available slots for ${doctor}`);
    }

    let availableSlots = [];
    records.forEach(function (record, index) {
      let availableSlot = {};
      availableSlot.slot_id = record.id;
      availableSlot.date = record._rawJson.fields.date;
      availableSlot.time = record._rawJson.fields.time;     
      availableSlots.push(availableSlot);      
    });    

    response
      // Set the status code to 200 OK
      .setStatusCode(200)
      // Set the Content-Type Header
      .appendHeader('Content-Type', 'application/json')
      // Set the response body
      .setBody({
        availableSlots
      });
    console.log(`Time elapsed: ${Date.now() - start} ms`);
    return callback(null, response);
  } catch (error) {
    console.error('Error fetching airtable record:', error);
    return callback(error, null);
  }
}
  