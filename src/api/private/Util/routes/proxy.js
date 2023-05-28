
const axios = require('axios');

module.exports = {
	async post(req, res) {
        const body = req.body;
        if (!body.Url) return Fail(400, 'You must specify a Url to proxy');
		
		const URL = body.Url;
		const Headers = body.Headers ? body.Headers : {};
		const ProxyBody = body.Body;
	

		try {
			const requestConfig = {
				url: URL,
				method: req.httpMethod,
				headers: Headers
			};

			if (ProxyBody) {
				requestConfig.data = ProxyBody;
			}

			const request = await axios(requestConfig);
			return res.status(200).json({
                success: true,
                data: request,
            });
		}
		catch (err) {
			return res.status(400).json({
                success: false,
                data: err,
            });
		}
	},
};