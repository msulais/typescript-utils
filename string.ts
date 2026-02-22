type StringIndex = number

export function stringToTitleCase(text: string): string {
	return text
		.split(' ')
		.map(v =>
			v.substring(0, 1).toUpperCase()
			+ v.substring(1).toLowerCase()
		)
		.join(' ')
}

export function stringToToggleCase(text: string): string {
	const result: string[] = []
	for (const char of text) {
		const isLower = char === char.toLowerCase()
		result.push(isLower ? char.toUpperCase() : char.toLowerCase())
	}

	return result.join('')
}

export function countString(text: string, regex: RegExp): number {
	return (text.match(regex) || []).length
}

export function reverseString(text: string): string {
	return [...text].reverse().join('')
}

export function advancedStringSearch(
	search: string,
	text: string,
	isSearchNormalized: boolean = false
): boolean {
	let searchNormalized = search
	if (!isSearchNormalized) {
		searchNormalized = search.replace(/\s+/g, '')
	}

	const searchLen = searchNormalized.length
	if (searchLen === 0) {
		return true
	}

	let j = 0
	const searchLower = searchNormalized.toLowerCase()
	for (let i = 0; i < text.length && j < searchLen; i++) {
		if (text[i].toLowerCase() === searchLower[j]) {
			j++
		}
	}

	return j === searchLen
}

/**
 * Smartly truncates text in the middle without using semicolons.
 *
 * @param text - The text to truncate
 * @param limit - The max length of the result
 * @param separator - The string to insert in the middle (default: "...")
 */
export const smartTruncate = (
	text: string,
	limit: number,
	separator: string = '...'
): string => {
	if (text.length <= limit) {
		return text
	}

	const truncateChar = () => {
		const show = limit - separator.length
		if (show <= 0) return separator.substring(0, limit)

		const mid = Math.ceil(show / 2)
		const end = Math.floor(show / 2)

		return (
			text.substring(0, mid) +
			separator +
			text.substring(text.length - end)
		)
	}
	const words = text.split(/ +/)
	if (words.length === 1) {
		return truncateChar()
	}

	let left: string[] = []
	let right: string[] = []
	let lIndex = 0
	let rIndex = words.length - 1
	let currentLen = separator.length
	let turn = 0 // 0 = left side, 1 = right side

	while (lIndex <= rIndex) {
		const word = turn === 0 ? words[lIndex] : words[rIndex]

		// Check if adding this word + a space exceeds the limit
		const space = (turn === 0 ? left.length : right.length) > 0 ? 1 : 0

		if (currentLen + word.length + space > limit) {
			break
		}

		currentLen += word.length + space
		if (turn === 0) {
			left.push(word)
			lIndex++
			turn = 1
		}
		else {
			right.unshift(word)
			rIndex--
			turn = 0
		}
	}

	// If we couldn't fit even one word on each side, fall back to char split
	if (left.length === 0 && right.length === 0) {
		return truncateChar()
	}

	const leftStr = left.join(' ')
	const rightStr = right.join(' ')
	return leftStr + separator + rightStr
}

export class SharedString {
	private _sharedString = new Map<string, StringIndex>()
	constructor(...values: string[]) {
		for (const value of values) {
			this.getIndex(value)
		}
	}

	toArray(): string[] {
		const values: string[] = []
		for (const [str, i] of this._sharedString) {
			values[i] = str
		}

		return values
	}

	getIndex(value: string): StringIndex {
		if (this._sharedString.has(value)) {
			return this._sharedString.get(value)!
		}

		const index = this._sharedString.size
		this._sharedString.set(value, index)
		return index
	}
}
