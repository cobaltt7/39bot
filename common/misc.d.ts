export type Falsy = "" | 0 | 0n | false | null | undefined;
export type NonFalsy<T> = T extends Falsy ? never : T;

export type FilterNonFalsy<T> =
	T extends readonly [infer F, ...infer R] ?
		F extends Falsy ?
			FilterNonFalsy<R>
		:	[F, ...FilterNonFalsy<R>]
	:	[];
export type WidenLiteral<T> =
	T extends string ? string
	: T extends number ? number
	: T extends boolean ? boolean
	: T extends bigint ? bigint
	: T extends symbol ? symbol
	: T;

export type UndefinedDomain =
	| symbol
	| ((...args: unknown[]) => unknown)
	| (new (...args: unknown[]) => unknown)
	| undefined;
	