import {
	Team,
	type User,
	inlineCode,
	type ChatInputCommandInteraction,
	type APIEmbedField,
} from "discord.js";
import { client } from "strife.js";
import constants from "../../common/constants.js";
import pkg from "../../package.json" assert { type: "json" };
import { columnize } from "strife.js";

const dependencyColumns = await getDependencies();

export default async function credits(interaction: ChatInputCommandInteraction): Promise<void> {
	const owner = getOwner();
	await interaction.reply({
		embeds: [
			{
				title: "Credits",
				description: `${client.user.displayName} is ${owner ? `maintained by ${owner} and ` : ""}hosted on [Fly.io](https://fly.io) using Node.JS ${process.version}.`,
				fields: dependencyColumns,
				color: constants.themeColor,
			},
		],
	});
}

function getOwner(): User | undefined {
	const { owner } = client.application;
	if (!(owner instanceof Team)) return owner ?? undefined;

	return (owner?.owner || owner?.members.first())?.user;
}

async function getDependencies(): Promise<APIEmbedField[]> {
	const dependencyNames = Object.keys({ ...pkg.dependencies });
	const promises = dependencyNames.map((name) =>
		import(`../../../node_modules/${name}/package.json`).then(
			(dependency: { default: { name: string; version: `${bigint}.${bigint}.${string}` } }) =>
				`- [${inlineCode(dependency.default.name)}@${
					dependency.default.version
				}](https://npmjs.com/package/${dependency.default.name}/v/${
					dependency.default.version
				})`,
			() => void 0,
		),
	);
	const dependencies = (await Promise.all(promises))
		.filter(Boolean)
		.toSorted((one, two) => one.localeCompare(two));
	return await columnize(dependencies, "🗄️ Third-party code libraries");
}
