module.exports = {
	async post(req, res) {
		const responseData = {
			isBanned: null,
			isSupporter: null,
			isSDCadetAllowed: null,
		};

		try {
			/* Fetch active ban (if any) */
			const ban = await req.utility.database.Schemas.Infractions_Bans.findOne({ userId: req.body.userId });
            
			if (ban && (ban.expiry - new Date() > 0)) {
				responseData.isBanned = ban;
			}
			
			const Player = await req.utility.database.Schemas.Player.findOne({ userId: req.body.userId });
			if (Player) {
				responseData.isSupporter = Player.premiumDays > 0;
				responseData.isEmailLinked = Player.email ? true : false;
				responseData.isTerminalLinked = true;
				try{
					const client = req.client;
					const SecurityServer = await client.guilds.fetch('957760516745486397')
					const IsPlayerInSecurity = await SecurityServer.members.fetch(Player.discordId)
					if(IsPlayerInSecurity){
						if(IsPlayerInSecurity.roles.cache.has('1002697503474462740')){
							responseData.isSDCadetAllowed = true
						}
					}
				} catch(err) {
					//console.log(err) I removed this console log due to console spam
				}
			} else {
				responseData.isTerminalLinked = false;
			}

			// /* Fetch active foundation blacklist (if any) */
			// const foundationBlacklists = await req.utility.infractions.blacklists.fetch(req.roblox.id, 'foundation');
			// if (foundationBlacklists[0]) responseData.activeFoundationBlacklist = foundationBlacklists[0];

			// /* Fetch active departmental/foundation suspensions (if any) */
			// const suspensions = await req.utility.infractions.suspensions.fetch(req.roblox.id);
			// for (const suspension of suspensions) {
			// 	if (req.utility.infractions.suspensions.isActive(suspension)) responseData.activeSuspensions.push(suspension);
			// }

			// /* Fetch certifications */
			// const player = await req.utility.database.Schemas.Player.findOne({
			// 	userId: req.roblox.id,
			// }).populate({
			// 	path: 'certifications',
			// 	populate: {
			// 		path: 'certification',
			// 		model: 'Certification',
			// 	},
			// });

			// if (player) {
			// 	responseData.certifications = player.certifications.map(x => `CERT/${x.type}/${x.code}`.toUpperCase());
			// }

			// /* Fetch driving license status */
			// const drivingLicense = await req.utility.player.drivinglicense.fetch(req.roblox.id);
			// if (drivingLicense) {
			// 	responseData.drivingLicenseStatus.licensed = true;

			// 	const activeDrivingSuspension = req.utility.player.drivinglicense.getActiveSuspension(drivingLicense);

			// 	if (activeDrivingSuspension) {
			// 		responseData.drivingLicenseStatus.suspended = true;
			// 	}
			// }
		} catch (err) {
			console.log(err)
			return res.status(500).json({
				success: false,
				message: err,
			});
		}

		/* Return response data */
		return res.status(200).json({
			success: true,
			data: responseData,
		});
	},
};