import * as path from 'path';

const sanitizedNames = new Map<string, string>();

function generateAlphaNumericString(input: string): string {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	// Create a simple hash of the input string
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Use the hash to generate a deterministic string
	let result = '';
	const hashStr = Math.abs(hash).toString();
	for (let i = 0; i < 10; i++) {
		const index = parseInt(hashStr[i % hashStr.length]) % characters.length;
		result += characters[index];
	}
	return result;
}

function sanitizeString(str: string): string {
	if (!sanitizedNames.has(str)) {
		const replacement = generateAlphaNumericString(str);
		sanitizedNames.set(str, replacement);
		return replacement;
	}
	return sanitizedNames.get(str)!;
}

export function sanitizeFilePath(filePath: string): string {
	if (!filePath.includes('/') && !path.extname(filePath)) {
		return filePath;
	}

	const protocolMatch = /^[^:]+:\/\//.exec(filePath);
	const protocol = protocolMatch ? protocolMatch[0] : '';
	const pathWithoutProtocol = protocol
		? filePath.slice(protocol.length)
		: filePath;

	const fileExtension = path.extname(pathWithoutProtocol);
	const fileWithoutExtension = pathWithoutProtocol.slice(
		0,
		pathWithoutProtocol.length - fileExtension.length
	);
	const fileParts = fileWithoutExtension.split('/');

	return protocol + fileParts.map(sanitizeString).join('/') + fileExtension;
}
