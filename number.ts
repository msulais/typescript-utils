export function safeNumber(num: number, fallback: number = 0): number {
	return isNumberNotDefined(num)? fallback : num
}

export function isNumberNotDefined(num: number): boolean {
	return Number.isNaN(num) as boolean || !Number.isFinite(num)
}

export function isNumberDefined(num: number): boolean {
	return !isNumberNotDefined(num)
}

export function adjustDecimalNumber(num: number, digits: number): number {
	return Number.parseFloat(num.toFixed(digits))
}

export function formatNumber(num: number, separator: {
	thousand?: string
	decimal?: string
} = {}): string {
	const {
		thousand = ',',
		decimal = '.'
	} = separator
	const sign = num < 0 ? '-' : ''
	const absNumber = Math.abs(num)
	const parts = numberToRealDigits(absNumber).split('.')
	const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand)

	let decimalPart = ''
	if (parts.length > 1) decimalPart = parts[1]

	return `${sign}${integerPart}${decimalPart.length > 0 ? decimal : ''}${decimalPart}`
}

/**
 * Convert input with scientific notation to real digit.
 * For example: `2.34e-3` become `0.00234`
 *
 * @param input
 * @returns
 */
export function numberToRealDigits(input: number): string {
	const regex = /([+-]?)(\d+)(\.\d+)?[Ee]([+\-])?(\d+)/
	const str: string = input.toString()

	const result = str.match(regex)
	if (!result) return str

	const sign = result[1]
	const num = result[2]
	const decimal = result[3] ?? '.0'
	const expSign = result[4]
	const exponent = Number.parseInt(result[5])

	if (expSign === '-') return (sign
		+ '0.'
		+ '0'.repeat(exponent - 1)
		+ num
		+ decimal.substring(1)
	)

	const leftover = exponent - (decimal.length - 1)
	return (sign
		+ num
		+ decimal.substring(1, exponent + 1)
		+ (leftover <= 0
			? '.' + decimal.substring(exponent + 1)
			: '0'.repeat(leftover)
		)
	)
}

export function binaryToFloat(input: string, bit: 32 | 64 = 64): number {
	if (/[^01]/.test(input)) {
		console.error('Input not valid: must contain only 0 and 1')
		return 0
	}

	const paddedInput = input.padStart(bit, '0')
	const buffer = new ArrayBuffer(8)
	const view = new DataView(buffer)
	if (bit === 32) {
		const intVal = parseInt(paddedInput, 2)
		view.setUint32(0, intVal)
		return view.getFloat32(0)
	} 

	const bigIntVal = BigInt("0b" + paddedInput)
	view.setBigUint64(0, bigIntVal)
	return view.getFloat64(0)
}

export function numberToBinary(input: number, bit: 32 | 64 = 64): string {
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
	if (bit !== 32 && bit !== 64) {
		bit = 64
	}

	let binary = ''
    if (bit === 32) {
        view.setFloat32(0, input)
        binary = view.getUint32(0).toString(2)
    }
	else {
		view.setFloat64(0, input)
		binary = view.getBigUint64(0).toString(2)
	} 

	return binary.padStart(bit, '0')
}
