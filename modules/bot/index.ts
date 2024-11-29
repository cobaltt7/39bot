import { defineChatCommand } from "strife.js";

import constants from "../../common/constants.ts";
import credits from "./credits.ts";
import status from "./status.ts";

if (constants.env === "production") {
	defineChatCommand(
		{
			name: "restart",
			description: "Restart the bot",
			restricted: true,
			access: constants.testingServer,
		},
		async (interaction) => {
			process.emitWarning(`${interaction.user.tag} is restarting the bot`);
			await interaction.reply("Restarting bot…");
			process.exit(1);
		},
	);
} else {
	defineChatCommand(
		{
			name: "kill",
			description: "Kill the bot",
			restricted: true,
			access: constants.testingServer,
		},
		async (interaction) => {
			process.emitWarning(`${interaction.user.tag} is killing the bot`);
			await interaction.reply("Killing bot…");
			process.exit(1);
		},
	);
}

defineChatCommand(
	{ name: "status", description: "See my current status information", access: true },
	status,
);
defineChatCommand(
	{ name: "credits", description: "List who and what allows me to work", access: true },
	credits,
);
