# google-sheets-schema

*(currently unpublished draft - do not try to use!)*

## What does this do?
Connects to an existing Google Sheets spreadsheet document, generates new sheets, and writes table headings for an existing spreadsheet (horizontal only at this time i.e. fields go across A1:Z). You might be asking yourself, but wait, can't I just open up a Google Sheets spreadsheet and enter a bunch of fields that way? Well, yes, you could and you'd probably spend a lot less time typing. But this is the start of project (or a few projects) that hopes to make different aspects of Google APIs slightly less of a struggle to use.

## Getting Started

`yarn add google-sheets-schema --dev`

or

`npm install google-sheets-schema --save-dev`

## Configuring Access

In order for this package to generate sheets and headings inside an existing Google Sheets spreadsheet you need to set up a few things:

- A JSON file containing your Google Sheets API Credentials
- A Google Sheets spreadsheet with editing permissions given to the email listed inside this JSON file
- A Google Sheets `spreadsheetId` for the spreadsheet
- And .env file to store environment variables

## Creating and Using Credentials

Head over to [Google Cloud console](https://console.cloud.google.com). You'll need to generate some API credentials by enabling a new service account for a new or existing project.  Give the account a name and role of `Project > Editor` and then download your API credentials in JSON format.

- Once you have the file downloaded rename it to `credentials.json` and place it in the root of your project file.
- Open the file and copy the `client_email` field value.
- Head over to your Google Sheets spreadsheet document. Click share and add that e-mail to the list of approved editors.
- Then copy the `spreadsheetId` from the URL of your spreadsheet
	- `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
- Create a `.env` file with the following:
 
```shell
GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"
SPREADSHEET_ID=<YOUR SPREADSHEET_ID GOES HERE>
```
- At this point if you're using version control with a public repository you should make a serious effort to add `credentials.json` and `.env` to your `.gitignore` so your credentials and spreadsheetId remain 100% private.

## Authenticate & Generate

With your API credentials and spreadsheetId set you can now create a node script for generating sheets with headings. Here's a basic example:

```javascript
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

```

Then run this file with NodeJS to generate new sheets in your specified spreadsheet for this document with the headings you entered as values.

`$ node index.js`

## How This Works...

The authenticate function is an async function that returns a JWT Auth object that the NodeJS Google apis client uses to authenticate the requests that we make. As long as you have your credentials set all you have to do is await that function and it will return the authClient object. Which is a nice utility in general for when using the google apis that require it.

**schemaValues** - a 2D array of key value pairs
Why a 2D array? Because behind the scenes we're using a JS Map object. You could also pass in here an object of key value pairs, but you'd have to use Object.entries() to convert it into an array.

```javascript
const keyValues = Object.entries({
	Book: [ 'id', 'title', 'author'],
	Author: [ 'id', 'name', 'birth_year']
});
```
This is equivalent to the example used above.

## Current Issues & Considerations
- No significant logging output or error handling. At the moment the best way to test out whether your fields are being added to a Google Spreadsheet is to just look at the spreadsheet while you run this. It should be updating in real-time as the generate requests are made.

- By design in order to generate a new sheet with a certain name you must first delete the sheet with the name you're trying to create. Otherwise the node script will assume you don't actually want to erase it and leave it and it's fields alone. At some point it would probably be more convenient to intelligently update fields of existing sheets.
  
- A Google Sheets spreadsheet can not have fewer than 1 sheets at any given time. For this reason it's suggested that you start with a fresh document and at least one sheet named something arbitrary as it will be deleted once your other sheets are generated.

### Do not run this on any spreadsheet that you wouldn't mind getting completely totally erased. Because it will do that. This is a script for initializing and not modifying existing spreadsheet documents*. **YOU HAVE BEEN WARNED.**

\* although this will probably change in the future, but for now angry warning