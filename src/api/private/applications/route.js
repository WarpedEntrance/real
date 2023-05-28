const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const routeFiles = fs.readdirSync(path.join(__dirname, '/routes')).filter(file => file.endsWith('.js'));

for (const file of routeFiles) {
	const route = require(path.join(__dirname, '/routes', file));
	const methodsRegistered = [];

	for (const method of Object.keys(route)) {
		if ((typeof route[method] == 'function') && router[method.toLowerCase()]) {
			router[method.toLowerCase()](`/${file.nameOverwrite ?? file.replace('.js', '')}`, (...args) => {
				try {
					return route[method](...args);
				}
				catch (err) {
					console.warn(err);
				}
			});
			methodsRegistered.push(method.toUpperCase());
		}
	}

	console.log(`Registered route ${file.nameOverwrite ?? file.replace('.js', '')} (${file}) (${methodsRegistered.join(', ')})`);
}

module.exports = router;