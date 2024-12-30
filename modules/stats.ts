import { ApplicationCommandOptionType } from "discord.js";
import { defineChatCommand } from "strife.js";

import constants from "../common/constants.js";
import { ThirtyNine } from "../common/database.js";

defineChatCommand(
	{
		name: "user-stats",
		description: "View statistics for a user",
		options: {
			user: {
				type: ApplicationCommandOptionType.User,
				description: "The user to view statistics of (defaults to you)",
				required: false,
			},
		},
	},
	async (interaction, { user = interaction.user }) => {
		const [stats] = await ThirtyNine.aggregate<{
			madeCount?: number;
			missedCount?: number;
			doubleCount?: number;
			guildCount?: number;
			// maxAtOnce?: number;
			// soloCount?: number;
		}>()
			.match({ user: user.id })
			.facet({
				made: [{ $match: { missed: false } }, { $count: "count" }],
				doubles: [
					{
						$match: {
							seconds: {
								$gte: constants.triggerTime,
								$lt: constants.triggerTime + 1,
							},
							missed: false,
						},
					},
					{ $count: "count" },
				],
				missed: [{ $match: { missed: true } }, { $count: "count" }],

				guilds: [
					{ $match: { missed: false } },
					{ $group: { _id: "$guild" } },
					{ $count: "count" },
				],
				// solos: [
				// 	{ $match: { missed: false } },
				// 	{ $group: { _id: "$hour", count: { $sum: 1 } } },
				// 	{ $match: { count: 1 } },
				// 	{ $count: "count" },
				// ],
				// maxAtOnce: [
				// 	{ $match: { missed: false } },
				// 	{ $group: { _id: "$hour", count: { $sum: 1 } } },
				// 	{ $sort: { count: -1 } },
				// 	{ $limit: 1 },
				// ],
			})
			.project({
				madeCount: { $first: "$made.count" },
				doubleCount: { $first: "$doubles.count" },
				missedCount: { $first: "$missed.count" },

				guildCount: { $first: "$guilds.count" },
				// soloCount: { $first: "$solos.count" },
				// maxAtOnce: { $first: "$maxAtOnce.count" },
			});

		if (!stats) {
			await interaction.reply({
				content: `${constants.emojis.mikuSad} No statistics found for ${user.toString()}`,
				ephemeral: true,
			});
			return;
		}
		await interaction.reply({
			embeds: [
				{
					description: `## ${user.toString()}’s statistics`,
					color: constants.themeColor,
					fields: [
						{
							name: `${constants.emojis._39} Total 39s`,
							value: (stats.madeCount ?? 0).toLocaleString(),
							inline: true,
						},
						{
							name: `${constants.emojis.miku39} Double 39s`,
							value: (stats.doubleCount ?? 0).toLocaleString(),
							inline: true,
						},
						{
							name: `${constants.emojis.mikuSad} Missed 39s`,
							value: (stats.missedCount ?? 0).toLocaleString(),
							inline: true,
						},

						{
							name: `${constants.emojis.mikuDual} Total 39 servers`,
							value: (stats.guildCount ?? 0).toLocaleString(),
							inline: true,
						},
						// {
						// 	name: `${constants.emojis.mikuShy} Solo 39s`,
						// 	value: (stats.soloCount ?? 0).toLocaleString(),
						// 	inline: true,
						// },
						// {
						// 	name: `${constants.emojis.mikus} Most 39s at once`,
						// 	value: (stats.maxAtOnce ?? 0).toLocaleString(),
						// 	inline: true,
						// },
					],
				},
			],
		});
	},
);
// defineChatCommand(
// 	{ name: "server-stats", description: "View statistics for this server", access: false },
// 	async (interaction) => {
// 		await interaction.reply("abc");
// 	},
// );
