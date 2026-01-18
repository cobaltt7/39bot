import { setTimeout as sleep } from "node:timers/promises";

import { defineChatCommand } from "strife.js";

const GIF_LENGTH = 9900;
const PARTS = [
	"GY9jpK3",
	"4F4CcRa",
	"YvISzPK",
	"JpzX2BH",
	"jvlcwsb",
	"yNMFj31",
	"wYaj4Au",
	"OiZF25E",
	"6Pvy2qm",
	"Iao7RMw",
	"59d9fiq",
	"gaDJeje",
	"X7sd7mp",
	"SeKTI9S",
	"4Q68EI7",
	"PXiIAqn",
	"fdINYjb",
	"orQHtNN",
	"x1djAK8",
	"vpl4SXs",
	"vebiMpJ",
	"0NWt8Pm",
] as const;

defineChatCommand({ name: "bad-apple", description: "..." }, async (interaction) => {
	const message = await interaction.reply(`https://i.imgur.com/${PARTS[0]}.gif`);
	for (const part of PARTS.slice(1)) {
		await sleep(GIF_LENGTH);
		try {
			await message.edit(`https://i.imgur.com/${part}.gif`);
		} catch {
			return;
		}
	}

	await sleep(GIF_LENGTH + 100);
	await message.edit("https://tenor.com/view/bad-apple-manu-touhou-gif-21182229");
});
