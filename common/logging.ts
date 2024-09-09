import {
	ChatInputCommandInteraction,
	chatInputApplicationCommandMention,
	inlineCode,
	type Message,
	type RepliableInteraction,
} from "discord.js";
import { serializeError } from "serialize-error";
import constants from "./constants.js";
import { ButtonStyle, ComponentType, type APIEmbed, type Embed } from "discord.js";
import { client } from "strife.js";
import assert from "node:assert";

process
	.on("uncaughtException", (error, origin) => logError(error, origin))
	.on("warning", (error) => logError(error, "warning"));

export async function logError(
	error: unknown,
	event: RepliableInteraction | string,
): Promise<Message<true> | undefined> {
	console.error(error);
	try {
		const name =
			error && typeof error === "object" && "name" in error ? `${error.name}` : "Error";
		if ("ExperimentalWarning" == name) return;

		return await log(
			`${constants.emojis.mikuSad} **${name}** occurred in ${
				typeof event == "string" ? inlineCode(event)
				: event.isChatInputCommand() ? commandInteractionToString(event)
				: inlineCode(
						event.isCommand() && event.command ?
							`/${event.command.name}`
						:	`${event.constructor.name}${
								event.isButton() ? `: ${event.customId}` : ""
							}`,
					)
			}`,
			{ files: [{ content: stringifyError(error), extension: "json" }] },
		);
	} catch (loggingError) {
		console.error(loggingError);
		process.exit(1);
	}
}

export default async function log(
	content: string,
	extra: {
		embeds?: (APIEmbed | Embed | undefined)[];
		files?: (string | { extension?: string; content: string })[];
		buttons?: ({ label: string } & (
			| { customId: string; style: Exclude<ButtonStyle, ButtonStyle.Link> }
			| { url: string }
		))[];
	} = {},
): Promise<Message<true>> {
	const channel = await client.channels.fetch(constants.channels.logs);
	assert(channel);
	assert("guild" in channel);
	assert(channel.isTextBased());

	const { external, embedded } = extra.files?.reduce<{
		external: (string | { extension?: string; content: string })[];
		embedded: { extension?: string | undefined; content: string }[];
	}>(
		(accumulator, file) => {
			if (typeof file === "string" || file.content.includes("```")) {
				return {
					embedded: accumulator.embedded,
					external: [...accumulator.external, file],
				};
			}

			const lines = file.content.split("\n");
			return lines.length > 10 || lines.some((line) => line.length > 100) ?
					{ embedded: accumulator.embedded, external: [...accumulator.external, file] }
				:	{ embedded: [...accumulator.embedded, file], external: accumulator.external };
		},
		{ external: [], embedded: [] },
	) ?? { external: [], embedded: [] };

	return await channel.send({
		content:
			content +
			(embedded.length ?
				embedded
					.map((file) => `\n\`\`\`${file.extension || ""}\n${file.content}\n\`\`\``)
					.join("")
			:	""),
		embeds: extra.embeds?.filter(Boolean),
		components: extra.buttons && [
			{
				components: extra.buttons.map((button) => ({
					style: ButtonStyle.Link,
					...button,
					type: ComponentType.Button,
				})),
				type: ComponentType.ActionRow,
			},
		],
		files: await Promise.all(
			external.map(async (file) => {
				if (typeof file === "string") {
					const response = await fetch(file);
					return {
						attachment: Buffer.from(await response.arrayBuffer()),
						name: new URL(file).pathname.split("/").at(-1),
					};
				}

				return {
					attachment: Buffer.from(file.content, "utf8"),
					name: `file.${file.extension || "txt"}`,
				};
			}),
		),
	});
}

export function stringifyError(error: unknown): string {
	return JSON.stringify(
		error,
		(_, value) =>
			typeof value === "bigint" || typeof value === "symbol" ? value.toString()
			: value instanceof Error ? generateError(value)
			: value,
		"  ",
	);
}
function generateError(error: unknown): object {
	if (typeof error !== "object" || !error) return { error };

	const serialized = serializeError(error);
	delete serialized.name;
	delete serialized.code;
	delete serialized.message;
	delete serialized.stack;

	const message =
		"message" in error ?
			typeof error.message === "string" && error.message.includes("\n") ?
				error.message.split("\n")
			:	error.message
		:	undefined;
	const { stack } = "stack" in error ? error : new Error();

	return {
		name: "name" in error ? error.name : undefined,
		code: "code" in error ? error.code : undefined,
		message,
		stack:
			typeof stack === "string" ?
				sanitizePath(stack)
					.split("\n")
					.slice(Array.isArray(message) ? message.length : 1)
			:	stack,
		...serialized,
	};
}

export function commandInteractionToString(
	interaction: ChatInputCommandInteraction,
): `</${string}:${string}>` {
	const subcommandGroup = interaction.options.getSubcommandGroup(false);
	const subcommand = interaction.options.getSubcommand(false);

	if (subcommandGroup && subcommand)
		return chatInputApplicationCommandMention(
			interaction.commandName,
			subcommandGroup,
			subcommand,
			interaction.commandId,
		);

	if (subcommand)
		return chatInputApplicationCommandMention(
			interaction.commandName,
			subcommand,
			interaction.commandId,
		);

	return chatInputApplicationCommandMention(interaction.commandName, interaction.commandId);
}

export function sanitizePath(unclean: string, relative = true): string {
	let decoded = undefined;
	try {
		decoded = decodeURIComponent(unclean);
	} catch {
		decoded = unclean;
	}

	const sanitized = decoded.replaceAll("\\", "/").replaceAll("file:///", "");
	return relative ? sanitized.replaceAll(sanitizePath(process.cwd(), false), ".") : sanitized;
}
