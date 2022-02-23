type NeonValue = NeonConfig | NeonArray | string | number | boolean | RegExp;
interface NeonConfig {
	[key: string]: NeonValue;
}
type NeonArray = NeonValue[];

export type NeonFile = NeonConfig;

interface IndexHolder {
	index: number;
}

function parseSpecialValue(value: string): NeonValue {
	if (value === 'true') {
		return true;
	}
	if (value === 'false') {
		return false;
	}
	if (/^[0-9]+(\.[0-9]+)?$/.test(value)) {
		return parseFloat(value);
	}
	if (
		(value.startsWith("'") && value.endsWith("'")) ||
		(value.startsWith('"') && value.endsWith('"'))
	) {
		value = value.slice(1, -1);
	}
	if (value.startsWith('#') && value.endsWith('#')) {
		return new RegExp(value.slice(1, -1).replace(/\\\\/g, '\\'));
	}
	return value;
}

function parseNeonArray(lines: string[], holder: IndexHolder): NeonArray {
	const arr: NeonArray = [];
	for (; holder.index < lines.length; holder.index++) {
		const line = filterOutComment(lines[holder.index]).trim();
		if (line === '') {
			continue;
		}
		if (!line.includes('-')) {
			holder.index--;
			break;
		}

		const [, ...value] = line.split('-');
		if (value.join('-').trim().length > 0) {
			arr.push(parseSpecialValue(value.join('-').trim()));
		} else {
			// Object
			holder.index++;
			const parsed = tryParse(lines, holder);
			if (parsed) {
				arr.push(parsed);
			}
		}
	}
	return arr;
}

function filterOutComment(line: string): string {
	let stringDelimiter: '"' | "'" | null = null;
	for (let i = 0; i < line.length; i++) {
		if ((line[i] === '"' || line[i] === "'") && line[i - 1] !== '\\') {
			if (line[i] === stringDelimiter) {
				stringDelimiter = null;
			} else if (stringDelimiter === null) {
				stringDelimiter = line[i] as '"' | "'";
			}
		}
		if (line[i] === '#' && stringDelimiter === null) {
			return line.slice(0, i);
		}
	}
	return line;
}

// TODO: fix hashes in the center of the strings
function parseNeonObject(lines: string[], holder: IndexHolder): NeonConfig {
	const obj: NeonConfig = {};
	for (; holder.index < lines.length; holder.index++) {
		const line = lines[holder.index].trim();
		const unCommented = filterOutComment(line).trim();
		if (unCommented === '') {
			continue;
		}
		if (unCommented === '-') {
			holder.index--;
			break;
		}

		const [key, ...value] = unCommented.split(':');
		if (value.length && value.join(':').trim().length > 0) {
			obj[key] = parseSpecialValue(value.join(':').trim());
		} else {
			// Special value
			holder.index++;
			const parsed = tryParse(lines, holder);
			if (parsed) {
				obj[key] = parsed;
			}
		}
	}
	return obj;
}

function tryParse(
	lines: string[],
	holder: IndexHolder
): NeonConfig | NeonArray | null {
	const line = lines[holder.index];
	if (!line) {
		return null;
	}
	if (line.includes(':')) {
		return parseNeonObject(lines, holder);
	} else if (line.includes('-')) {
		return parseNeonArray(lines, holder);
	} else {
		holder.index++;
		return tryParse(lines, holder);
	}
}

export function parseNeonFile(content: string): NeonConfig {
	return parseNeonObject(content.split('\n'), { index: 0 });
}
