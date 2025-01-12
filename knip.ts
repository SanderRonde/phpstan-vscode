import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	entry: ['client/src/extension.ts', 'server/src/server.ts'],
	project: ['{client,server}/**/*.{js,ts}'],
	include: ['typeMembers'],
	exclude: ['devDependencies', 'unlisted', 'binaries', 'unresolved'],
};

export default config;
