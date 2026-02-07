export function analyzeArrayIntersect<T>(original: T[], target: T[]) {
	const added: T[] = []
	const removed: T[] = []
	const set_original = new Set(original)
	const set_target = new Set(target)
	for (const item of target) {
		if (set_original.has(item)) {
			continue
		} 

		added.push(item)
	}

	for (const item of original) {
		if (set_target.has(item)) {
			continue
		}

		removed.push(item)
	}

	return { added, removed }
}

export function binarySearch(array: number[], target: number): number | null {
	let left = 0
	let right = array.length - 1

	while (left <= right) {
		const middle = Math.floor((left + right) / 2)
		if (array[middle] === target) return middle
		else if (array[middle] < target) left = middle + 1
		else right = middle - 1
	}

	return null
}

export function isArrayEqual<T, U>(arr: T[], target: U[]): boolean {
	return arr.toString() === target.toString()
}

export function shuffleArray<T>(arr: T[]): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]]
	}

	return arr
}

export function moveArrayElement<T>(
	arr: T[],
	oldIndex: number,
	newIndex: number,
	allowOutOfIndex: boolean = true
) {
	while (oldIndex < 0) {
		oldIndex += arr.length
	}
	while (newIndex < 0) {
		newIndex += arr.length
	}

	if (newIndex >= arr.length) {
		if (allowOutOfIndex) {
			let k = newIndex - arr.length
			while ((k--) + 1) {
				arr.push(undefined as T)
			}
		}
		else {
			return arr
		}
	}

	const [element] = arr.splice(oldIndex, 1)
	arr.splice(newIndex, 0, element)
	return arr
}

/**
 * Compresses an array of mixed types by identifying sequential numbers and converting them
 * into a shorter string representation only if it saves character space.
 *
 * @param input - An array containing numbers, strings, objects, etc.
 * @returns An array where sequences of numbers are replaced by string tokens.
 *
 * ### Examples
 * ```ts
 * compressArraySequences([1, 2, 3, 4, 5]) // Returns ["1+4"] (Saved space)
 * compressArraySequences([6, 7])          // Returns [6, 7] (Token "6+1" (including quote) is longer than "6,7")
 * compressArraySequences([10, 9, 8, "A"]) // Returns ["10-2", "A"] (Handles descending & mixed types)
 * ```
 */
export function compressArraySequences<T>(input: T[]): T[] {
	const output: T[] = []
	let buffer: number[] = []
	let direction = 0

	const flushBuffer = () => {
		if (buffer.length === 0) return

		if (buffer.length === 1) {
			output.push(buffer[0] as T)
			buffer = []
			direction = 0
			return
		}

		const start = buffer[0]
		const end = buffer[buffer.length - 1]
		const diff = Math.abs(start - end)
		const sign = start < end ? "+" : "-"

		const originalCost = buffer.join(",").length
		const compressedString = `${start}${sign}${diff}`
		const compressedCost = compressedString.length + 2

		if (compressedCost < originalCost) {
			output.push(compressedString as T)
		} else {
			output.push(...buffer as T[])
		}

		buffer = []
		direction = 0
	}

	for (let i = 0; i < input.length; i++) {
		const curr = input[i]

		if (typeof curr !== 'number') {
			flushBuffer()
			output.push(curr)
			continue
		}

		if (buffer.length === 0) {
			buffer.push(curr)
			continue
		}

		const prev = buffer[buffer.length - 1]
		const mathDiff = curr - prev

		if (Math.abs(mathDiff) !== 1) {
			flushBuffer()
			buffer.push(curr)
			continue
		}

		if (direction !== 0 && mathDiff !== direction) {
			flushBuffer()
			buffer.push(curr)
			continue
		}

		buffer.push(curr)
		direction = mathDiff
	}

	flushBuffer()
	return output
}

/**
 * Expands a compressed array back into its original form by parsing string tokens.
 *
 * @param input - An array containing potential compression tokens (e.g., "1+4").
 * @returns The fully expanded array with original number sequences restored.
 *
 * ### Examples
 * ```ts
 * decompressArraySequences(["1+4"])       // Returns [1, 2, 3, 4, 5]
 * decompressArraySequences(["10-2", "A"]) // Returns [10, 9, 8, "A"]
 * decompressArraySequences([6, 7, "C"])   // Returns [6, 7, "C"] (No tokens found)
 * ```
 */
export function decompressArraySequences<T>(input: T[]): T[] {
	const output: T[] = []
	const pattern = /^(-?\d+)([+-])(\d+)$/

	for (const item of input) {
		if (typeof item !== 'string') {
			output.push(item)
			continue
		}

		const match = item.match(pattern)

		if (!match) {
			output.push(item)
			continue
		}

		const start = parseInt(match[1], 10)
		const sign = match[2]
		const diff = parseInt(match[3], 10)

		if (sign === '+') {
			for (let i = 0; i <= diff; i++) output.push(start + i as T)
		} else {
			for (let i = 0; i <= diff; i++) output.push(start - i as T)
		}
	}

	return output
}
