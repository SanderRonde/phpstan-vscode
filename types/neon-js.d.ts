declare module 'neon-js' {
	export class Map {
		public get(key: string): Neon;
		public has(key: string): boolean;
		public forEach(callback: (key: string, value: Neon) => void): void;
		public isList(): boolean;
		public values(): Neon[];
		public keys(): string[];
		public items(): { key: string; value: Neon }[];
		public toObject(): Record<string, Neon>;
	}

	type Neon = string | number | boolean | Map;

	export function decode(content: string): Neon;
	export function encode(content: Neon): string;
}
