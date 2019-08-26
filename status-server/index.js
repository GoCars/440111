const {buffer, text, json, send} = require('micro')
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
const sendSms = require('./sendSms');
const cors = require('micro-cors')();
const MongoClient = require('mongodb').MongoClient;
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

function updateRedirect(number, db) {
	return new Promise((resolve, reject) => {
		// Get the documents collection
	  const collection = db.collection('documents');
	  // Update document where a is 2, set b equal to 1
	  collection.updateOne({ type : 'redirect' }
	    , { $set: { number : number } }, function(err, result) {
	    if (err) return reject(err);
			if (result.result.n === 1) {
				return resolve(result);
			}
			reject('error updating document');
	  });
	})
}

function insertRedirect (doc, db) {
	return new Promise((resolve, reject) => {
		const collection = db.collection('documents');
	 // Insert some documents
	 collection.insertMany([
		 doc
	 ], function(err, result) {
		 if (err) return reject(err);
		 if (result.result.n === 1 && result.ops.length) {
			 return resolve(result);
		 }
		 reject('Insert document error');
	 });
	});
}

async function redirectNumber(newNumber) {
	const {db, client} = await connect();
	const existingRedirect = await getRedirectDocument(db);
	console.log(existingRedirect)
	if (existingRedirect && existingRedirect.length === 1) {
		const doc = existingRedirect[0];
		if (newNumber === doc.number)return;
		await updateRedirect(newNumber, db);
		await sendSms({
			to: doc.number,
			body: `440111 - Redirect has been disabled to this number. Phone Calls & Texts are now redirected to ${newNumber}`,
			from: process.env.NUMBER
		})
		await sendSms({
			to: newNumber,
			body: `440111 - Phone Calls & Texts are now redirected to this number`,
			from: process.env.NUMBER
		})
	} else if (existingRedirect.length === 0) {
		await insertRedirect({type: 'redirect', number: newNumber}, db);
	}
	client.close();
}

module.exports = cors(async (req, res) => {
	if (req.method === 'GET') {
		if (req.url === '/status') {
			const {db} = await connect();
			const existingRedirect = await getRedirectDocument(db);
			if (existingRedirect && existingRedirect.length ===1) {
				return send(res, 200, { number: existingRedirect[0].number })
			}
			return send(res, 500, {error: 'server error'});
		}
		const {db, client} = await connect();
		const existingRedirect = await getRedirectDocument(db);
		let numberTo = process.env.DEFAULT_NUMBER;
		if(existingRedirect && existingRedirect.length === 1) {
			numberTo = existingRedirect[0].number || numberTo;
		}
		res.setHeader('content-type', 'text/xml');
		return send(res, 200, `<?xml version="1.0" encoding="UTF-8"?>
			<Response>
				<Dial>${numberTo}</Dial>
			</Response>
		`)
	}
	if (req.method === 'POST') {
		const buf = await buffer(req)
	  const txt = await text(req)
	  const js = await json(req)
		if (js.token !== process.env.TOKEN) {
		 	send(res, 401, { error: 'Unauthorized token' })
			return;
		}
		if (js.number) {
			await redirectNumber(js.number);
		}
		return 'POST';
	}

  return `http method ${req.method} not supported`;
})

process.on('SIGINT', () => {
	if(_client) {
		console.log('closing db connection');
		_client.close();
	}
})
