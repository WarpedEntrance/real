const redis = require('redis');

const client = redis.createClient({
	url: `${process.env.REDIS}`,
});

client.connect();

client.on('error', function(error) {
	console.error(error);
});
client.on('ready', function() {
	console.log('Redis ready!');
});
client.on('connect', function() {
	console.log('Redis connected!');
});
client.on('reconnecting', () => console.log('client is reconnecting'));
module.exports = client;