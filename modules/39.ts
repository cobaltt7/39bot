import type { Snowflake } from "discord.js";

import { Collection } from "discord.js";
import { client, defineEvent } from "strife.js";

import constants from "../common/constants.ts";
import { ThirtyNine } from "../common/database.ts";

type Last39 = { hour: number; users: Set<Snowflake> };
const last39s = new Collection<Snowflake, Last39>();

defineEvent("messageCreate", async (message) => {
	const has39 = message.guild && /\b(?:39|thirty[ -]?nine)\b/i.test(message.content);
	if (!has39) return;

	const canReact = message.channel.isDMBased() || message.channel.permissionsFor(client.user);

	const minutes = message.createdAt.getUTCMinutes();
	const seconds = message.createdAt.getUTCSeconds();
	const milliseconds = message.createdAt.getUTCMilliseconds();
	const hour =
		message.createdTimestamp
		- ((minutes < constants.triggerTime ? minutes + 60 : minutes) - constants.triggerTime)
			* 60_000
		- seconds * 1000
		- milliseconds;

	if (minutes < constants.triggerTime || minutes > constants.triggerTime + 5) {
		if (canReact) await message.react(constants.emojis.miku);
		return;
	}

	const last39 = await retriveLast39s({ hour, guild: message.guild.id });
	if (minutes !== constants.triggerTime) {
		if (last39.hour === hour)
			if (last39.users.has(message.author.id)) {
				if (canReact) await message.react(constants.emojis.miku);
				return;
			} else last39.users.add(message.author.id);

		if (canReact) await message.react(constants.emojis.mikuSad);
		await new ThirtyNine({
			guild: message.guild.id,
			user: message.author.id,
			hour,
			missed: true,
		}).save();
		return;
	}

	if (last39.hour === hour) {
		if (last39.users.has(message.author.id)) return;
		last39.users.add(message.author.id);
	} else last39s.set(message.guild.id, { hour, users: new Set([message.author.id]) });

	await new ThirtyNine({
		guild: message.guild.id,
		user: message.author.id,
		hour,
		seconds: seconds + milliseconds / 1000,
		missed: false,
	}).save();
	if (canReact)
		await message.react(constants.emojis[seconds === constants.triggerTime ? "miku39" : "_39"]);
});

async function retriveLast39s({
	guild,
	hour,
}: {
	guild: Snowflake;
	hour: number;
}): Promise<Last39> {
	const last39 = last39s.get(guild);
	if (last39) return last39;

	const [{ users } = { users: [] }] = await ThirtyNine.aggregate<{
		_id: null;
		users: Snowflake[];
	}>([{ $match: { guild, hour } }, { $group: { _id: null, users: { $addToSet: "$user" } } }]);

	const data = { hour, users: new Set(users) };
	last39s.set(guild, data);
	return data;
}
