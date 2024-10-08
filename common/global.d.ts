/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Snowflake } from "discord.js";
import type { FilterNonFalsy, NonFalsy, UndefinedDomain, WidenLiteral } from "./misc.js";

declare global {
	interface Array<T> {
		lastIndexOf(
			searchElement: T | (NonNullable<unknown> & WidenLiteral<T>),
			fromIndex?: number,
		): number;
		indexOf(
			searchElement: T | (NonNullable<unknown> & WidenLiteral<T>),
			fromIndex?: number,
		): number;
		filter<S extends T>(
			predicate: (value: T, index: number, array: readonly T[]) => value is S,
			thisArg?: undefined,
		): S[];
		filter<P extends (value: T, index: number, array: T[]) => unknown>(
			predicate: P,
			thisArg?: unknown,
		): (P extends BooleanConstructor ? NonFalsy<T> : T)[];
	}
	interface ReadonlyArray<T> {
		includes(
			searchElement: T | (NonNullable<unknown> & WidenLiteral<T>),
			fromIndex?: number,
		): searchElement is T;
		lastIndexOf(
			searchElement: T | (NonNullable<unknown> & WidenLiteral<T>),
			fromIndex?: number,
		): number;
		indexOf(
			searchElement: T | (NonNullable<unknown> & WidenLiteral<T>),
			fromIndex?: number,
		): number;
		map<U>(
			callbackfn: (value: T, index: number, array: readonly T[]) => U,
			thisArg?: unknown,
		): { readonly [K in keyof this]: U };
		filter<S extends T>(
			predicate: (value: T, index: number, array: readonly T[]) => value is S,
			thisArg?: undefined,
		): S[];
		filter<P extends (value: T, index: number, array: T[]) => unknown>(
			predicate: P,
			thisArg?: unknown,
		): P extends BooleanConstructor ? FilterNonFalsy<this> : T[];
	}
	interface ArrayConstructor {
		isArray(arg: unknown): arg is unknown[] | readonly unknown[];
	}
	interface ReadonlySet<T> {
		has(value: T | (NonNullable<unknown> & WidenLiteral<T>)): boolean;
	}

	interface ObjectConstructor {
		entries<T, U extends PropertyKey>(
			o: ArrayLike<T> | Record<U, T>,
		): readonly [U extends number ? `${U}` : U, T][];
		fromEntries<T, U extends PropertyKey>(entries: Iterable<readonly [U, T]>): Record<U, T>;
		keys<U extends PropertyKey>(
			entries: Record<U, unknown>,
		): readonly (U extends number ? `${U}` : U)[];
	}

	interface Response {
		json<T = unknown>(): Promise<T>;
	}
	interface JSON {
		stringify<T>(
			value: T,
			replacer?: (number | string)[] | null | undefined,
			space?: number | string | undefined,
		): T extends UndefinedDomain ? undefined
		: UndefinedDomain extends T ? undefined
		: string;
		stringify<T>(
			value: T,
			replacer: (this: unknown, key: string, value: unknown) => unknown,
			space?: number | string | undefined,
		): string;
		stringify<T>(
			value: T,
			replacer?: ((this: unknown, key: string, value: unknown) => unknown) | undefined,
			space?: number | string | undefined,
		): string | undefined;

		parse(text: string): unknown;
		parse<T = unknown>(
			text: string,
			reviver: <M extends string>(this: Record<M, unknown>, key: M, value: unknown) => T,
		): T;
	}

	interface BooleanConstructor {
		// eslint-disable-next-line @typescript-eslint/ban-types
		new (value?: unknown): Boolean;
		<T>(value?: T): value is NonFalsy<T>;
		// eslint-disable-next-line @typescript-eslint/ban-types
		readonly prototype: Boolean;
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
		}
	}
}
