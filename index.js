'use strict';

const { sheets, buildRequests, buildUpdateRequests, getCurrentSheets } = require('./utils');
const { google } = require('googleapis');

async function authenticate(){
  const auth = await google.auth.getClient({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive ', 'https://www.googleapis.com/auth/drive.file']
  }); 
  return auth;
}

class GoogleSheetSchema {
  constructor({schemaValues, spreadsheetId, authClient}){
    this.spreadsheetId = spreadsheetId;
    this.schema = new Map(schemaValues);
    this.auth = authClient
  }

  async generateSheets(){
    const currentSheets = await getCurrentSheets(this.auth, this.spreadsheetId);
    const requests = buildRequests(this.schema, currentSheets);
    // if our requests are empty then do nothing
    if(requests.length>0){
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId:this.spreadsheetId,
        resource: {
          requests: [...requests]
        },
        auth: this.auth
      });
      const updateRequests = buildUpdateRequests({
        addSheetResponse,
        spreadsheetId: this.spreadsheetId,
        schema: this.schema,
        auth: this.auth
      });
      updateRequests.forEach( async (req) => {
        try {
          const addFields = await sheets.spreadsheets.values.append(req);
        }catch(err){
          console.log(err);
        }
      });
    }
  }
}

module.exports = {GoogleSheetSchema, authenticate};