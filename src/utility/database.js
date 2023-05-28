const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const database = {
	mongoose: mongoose,
	connected: false,
	Schemas: {},
};

const getFiles = (dir) => {
	let results = [];
	const list = fs.readdirSync(dir);
	list.forEach(function(file) {
		file = dir + '/' + file;
		const stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(getFiles(file));
		}
		else {
			/* Is a file */
			results.push(file);
		}
	});
	return results;
};

mongoose.connect(`${process.env.DB_URL}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		database.connected = true;
		console.log('Connected to database');
	})
	.catch((err) => {
		console.error('[FATAL] Could not connect to database:', err);
		process.exit(1);
	});

for (const FilePath of getFiles(path.join(__dirname, 'schemas'))) {
	const file = require(FilePath);

	if (file.name && file.schema) {
		database.Schemas[file.name] = mongoose.model(file.name, file.schema);

		console.log('Registered database Schema:', file.name);
	}
}

module.exports = database;
