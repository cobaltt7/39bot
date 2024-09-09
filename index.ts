import { GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import { client, login } from "strife.js";
import constants from "./common/constants.js";
import pkg from "./package.json" assert { type: "json" };
import log, { logError } from "./common/logging.js";

dns.setDefaultResultOrder("ipv4first");

if (
	process.env.BOT_TOKEN.startsWith(Buffer.from(constants.users.bot).toString("base64") + ".") &&
	!process.argv.includes("--production")
)
	throw new Error("Refusing to run on the production bot without `--production` flag");

await mongoose.connect(process.env.MONGO_URI);

await login({
	modulesDirectory: fileURLToPath(new URL("./modules", import.meta.url)),
	async handleError(error, event) {
		await logError(error, event);
	},
	clientOptions: {
		intents:
			GatewayIntentBits.Guilds |
			GatewayIntentBits.GuildMessages |
			GatewayIntentBits.MessageContent,
		presence: { status: "dnd" },
	},
	commandErrorMessage: `${constants.emojis.mikuSad} An error occurred.`,
});

if (constants.env === "production")
	await log(`${constants.emojis.miku} Restarted bot on version **v${pkg.version}**`);

client.user.setStatus("online");
