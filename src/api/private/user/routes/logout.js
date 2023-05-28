module.exports = {
	async post(req, res) {
		/* Currently does nothing */

		/* Return response data */
		return res.status(200).json({
			success: true,
			data: {},
		});
	},
};