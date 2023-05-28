const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = {
	StartAPI(client) {
		const app = express();
		const port = process.env.PORT || 8080;

		function isClass(v) {
			return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
		}

		const utilityFiles = fs.readdirSync(path.join(__dirname, '../utility')).filter(file => file.endsWith('.js'));
		const utility = {};

		for (const file of utilityFiles) {
			const route = require(path.join(__dirname, '../utility', file));
			const utilityName = file.replace('.js', '');

			if (isClass(route)) {
				utility[utilityName] = new route();
			}
			else {
				utility[utilityName] = route;
			}
		}

		app.use(express.json());

		app.use((req, res, next) => {
			req.utility = utility;
			req.client = client;
			next();
		});

		/* API */
		const api = express.Router();
		const privateRoutes = fs.readdirSync(path.join(__dirname, '/private'), { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name);

		app.use('/api', api);
		api.use((req, res, next) => {
			if (!req.headers['x-api-key']) {
				return res.status(401).json({
					success: false,
					message: 'Authentication required',
				});
			}

			if (req.headers['x-api-key'] !== process.env.API_KEY) {
				return res.status(401).json({
					success: false,
					message: 'Unauthorized',
				});
			}

			next();
		});

		for (const route of privateRoutes) {
			console.log(`Loading private route /api/${route}`);
			const router = require(path.join(__dirname, '/private', route, '/route.js'));

			api.use(`/${route}`, router);
			console.log(`Loaded private route /api/${route}`);
		}

		/* PUBLIC */
		const codeRoute = express.Router();
		app.use('/code', codeRoute);
		codeRoute.get('/', (req, res) => {
			if (req.query.code) {
				res.send(`Your code is:\n ${req.query.code}`);
			} else {
				res.send('No code provided');
			}
		})

		const public = express.Router();
		const publicRoutes = fs.readdirSync(path.join(__dirname, '/public'), { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name);

		app.use('/public', public);

		for (const route of publicRoutes) {
			console.log(`Loading public route /public/${route}`);
			const router = require(path.join(__dirname, '/public', route, '/route.js'));

			api.use(`/${route}`, router);
			console.log(`Loaded public route /public/${route}`);
		}

		app.listen(port);
		console.log(`API listening on :${port}`);
	}
}