module.exports = {
	async get(req, res) {
        print('t')
		try {
            if (req.queryStringParameters.code) {
                // Display req.queryStringParameters.code to the user
                return print(req.queryStringParameters.code);
            }
        } catch (err) {
            return res.status(400).json({
                success: false,
                data: err,
            });
        }
	},
};