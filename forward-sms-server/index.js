const {buffer, text, json, send} = require('micro')
const MongoClient = require('mongodb').MongoClient;
const parse = require('urlencoded-body-parser');
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
// Use connect method to connect to the server
let _db = null;
let _client = null;
function connect() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(process.env.MONGO_DB_URL, function(err, client) {
		  if (err) return reject(err)
		  console.log("Connected correctly to server");
		  const db = client.db(process.env.MONGO_DB_NAME);
			_db = db;
			_client = client;
			resolve({db, client})
		});
	});
};

function getRedirectDocument(db, client) {
	return new Promise((resolve, reject) => {
		const collection = db.collection('documents');
	  // Find some documents
	  collection.find({type: 'redirect'}).toArray(function(err, docs) {
			if (err) return reject(err)
	    console.log("Found the following records");
	    console.log(docs)
	    resolve(docs);
	  });
	})
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const {db, client} = await connect();
		const existingRedirect = await getRedirectDocument(db);
		let numberTo = process.env.DEFAULT_NUMBER;
		if(existingRedirect && existingRedirect.length === 1) {
			numberTo = existingRedirect[0].number || numberTo;
    }
    const data = await parse(req);
    if (!data) return `400, unknown body`;
    const {From, Body} = data;
		res.setHeader('content-type', 'text/xml');
		return send(res, 200, `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
          <Message to="${numberTo}"> From:${From} : ${Body} </Message>
      </Response>
		`)
  }
  return `http method ${req.method} not supported`;
};

process.on('SIGINT', () => {
	if(_client) {
		console.log('closing db connection');
		_client.close();
	}
})
