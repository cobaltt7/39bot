const env =
	process.argv.some((file) => file.endsWith(".test.js")) ? "testing"
	: process.env.NODE_ENV === "production" ? "production"
	: "development";

export default {
	collectorTime: 45_000,

	channels: {
		chat: "1265654803086704711",
		updates: "1265655121828647066",
		logs: env === "development" ? "901225174974726177" : "897639265696112670",
	},

	emojis: {
		_39: "<:emoji:1279931403756240897>",
		miku: "<:emoji:1280163769397280778>",
		miku39: "<:emoji:1279951572465487963>",
		mikuDual: "<:emoji:1280318589534081044>",
		mikus: "<:emoji:1280318914307559434>",
		mikuSad: "<:emoji:1279939041630093424>",
		mikuShy: "<:emoji:1280318715581300778>",
	},

	env,

	testingServer: "901225174974726174",
	themeColor: 0x39_c5_bb,
	triggerTime: 39,

	users: {
		bot: "1279619856890855505",
	},
} as const;
