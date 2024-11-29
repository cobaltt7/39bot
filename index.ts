import assert from "node:assert";
import dns from "node:dns";
import { fileURLToPath } from "node:url";

import { ActivityType, GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import { client, logError, login } from "strife.js";

import constants from "./common/constants.ts";
import pkg from "./package.json" with { type: "json" };

dns.setDefaultResultOrder("ipv4first");

if (
	process.env.BOT_TOKEN.startsWith(Buffer.from(constants.users.bot).toString("base64") + ".") &&
	!process.argv.includes("--production")
)
	throw new Error("Refusing to run on the production bot without `--production` flag");

await mongoose.connect(process.env.MONGO_URI);

await login({
	modulesDirectory: fileURLToPath(new URL("./modules", import.meta.url)),
	handleError: { channel: constants.channels.logs, emoji: constants.emojis.mikuSad },
	clientOptions: {
		intents:
			GatewayIntentBits.Guilds |
			GatewayIntentBits.GuildMessages |
			GatewayIntentBits.MessageContent,
		presence: { status: "dnd" },
	},
	commandErrorMessage: `${constants.emojis.mikuSad} An error occurred.`,
});

const channel = await client.channels.fetch(constants.channels.logs);
assert(channel?.isSendable());
process
	.on(
		"uncaughtException",
		async (error, event) =>
			await logError({ error, event, channel, emoji: constants.emojis.mikuSad }),
	)
	.on(
		"warning",
		async (error) =>
			await logError({ error, event: "warning", channel, emoji: constants.emojis.mikuSad }),
	);

client.user.setPresence({
	status: "idle",
	activities: [{ name: "custom status", state: "PUBLIC BETA", type: ActivityType.Custom }],
});

if (constants.env === "production")
	await channel.send(`${constants.emojis.miku} Restarted bot on version **v${pkg.version}**`);
