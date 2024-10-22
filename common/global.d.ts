/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import "@total-typescript/ts-reset";
import type { Snowflake } from "discord.js";
import type constants from "./constants.js";

declare global {
	interface ReadonlyArray<T> {
		map<U>(
			callbackfn: (value: T, index: number, array: readonly T[]) => U,
			thisArg?: unknown,
		): { readonly [K in keyof this]: U };
	}

	interface String {
		split<Separator extends RegExp | string, Limit extends number>(
			separator: Separator,
			limit?: Limit,
		): Limit extends 0 ? []
		: Separator extends "" ? string[]
		: [string, ...string[]];
		startsWith<P extends string>(searchString: P, position?: 0): this is `${P}${string}`;
		endsWith<P extends string>(
			searchString: P,
			endPosition?: undefined,
		): this is `${string}${P}`;
		toLowerCase<T extends string>(this: T): Lowercase<T>;
		toLocaleLowerCase<T extends string>(this: T): Lowercase<T>;
		toUpperCase<T extends string>(this: T): Uppercase<T>;
		toLocaleUpperCase<T extends string>(this: T): Uppercase<T>;
	}

	namespace NodeJS {
		/**
		 * @example
		 * 	GUILD_ID = …
		 * 	BOT_TOKEN = …
		 * 	MONGO_URI = mongodb://127.0.0.1:27017/scradd
		 * 	NODE_ENV = development
		 */
		interface ProcessEnv {
			/** ID of the main server for the app to operate in. */
			GUILD_ID: Snowflake;
			/** Token of the bot. */
			BOT_TOKEN: string;
			/** URI to connect to MongoDB with. */
			MONGO_URI: string;
			/** Used to configure {@link constants.env}. */
			NODE_ENV: "development" | "production";
		}
	}
}
