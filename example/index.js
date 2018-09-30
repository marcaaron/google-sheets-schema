const { GoogleSheetSchema, authenticate } = 'google-sheets-schema';

const keyValues = [
	['Book', [
		'id',
		'title',
		'author'
	]],
	['Author', [
		'id',
		'name',
		'birth_year'
	]]
];

// Authenticate the client and generate sheets/rows

(async function init(){
  try{
    const auth = await authenticate();        
    const schema = new GoogleSheetSchema({
      spreadsheetId: process.env.SPREADSHEET_ID,
      schemaValues: keyValues,
      authClient: auth
    });
    await schema.generateSheets();
    console.log('done');
  } catch(err){
    console.log(err);
  }
})();