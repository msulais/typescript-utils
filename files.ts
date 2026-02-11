/**
 * @param maxWidth - (Optional) Max width to resize down to.
 */
export async function compressToJpeg(image: Blob, quality: number = 0.8, maxWidth?: number): Promise<Blob> {
	const SIZE_THRESHOLD = 250 * 1024
	if (image.size < SIZE_THRESHOLD) {
		return image
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = (event) => {
			const img = new Image()
			img.onload = () => {
				const canvas = document.createElement('canvas')
				let width = img.width
				let height = img.height
				if (maxWidth && width > maxWidth) {
					height = Math.round((height * maxWidth) / width)
					width = maxWidth
				}

				canvas.width = width
				canvas.height = height
				const ctx = canvas.getContext('2d')
				if (!ctx) {
					reject(new Error('Could not get canvas context'))
					return
				}

				ctx.fillStyle = '#FFFFFF'
				ctx.fillRect(0, 0, width, height)
				ctx.drawImage(img, 0, 0, width, height)
				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob)
						} else {
							reject(new Error('Canvas toBlob failed'))
						}
					},
					'image/jpeg',
					quality
				)
			}

			img.onerror = (err) => reject(err)
			if (event.target?.result) {
				img.src = event.target.result as string
			}
			else {
				reject(new Error('FileReader failed to load result'))
			}
		}

		reader.onerror = (err) => reject(err)
		reader.readAsDataURL(image)
	})
}

export function isPNGHasTransparency(pngBlob: Blob): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(pngBlob)
		const img = new Image()
		img.onload = () => {
			URL.revokeObjectURL(url)

			const canvas = document.createElement('canvas')
			canvas.width = img.width
			canvas.height = img.height

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				reject(new Error('Could not get Canvas context'))
				return
			}

			ctx.drawImage(img, 0, 0)

			// Get all pixel data
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

			// Check Alpha channel (every 4th value) for values < 255
			for (let i = 3; i < data.length; i += 4) {
				if (data[i] < 255) {
					resolve(true)
					return
				}
			}

			resolve(false)
		}

		img.onerror = (error) => {
			URL.revokeObjectURL(url)
			reject(error)
		}
		img.src = url
	})
}

export async function hashFileWeb(file: File | Blob, algorithm: string = 'SHA-256'): Promise<string> {
	const buffer = await file.arrayBuffer()
	const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
	return hashHex;
}

export function downloadFileByUrl(url: string, filename: string): void {
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	link.click()
	link.remove()
}

export async function pickFile(
	accept: string | null,
	multiple: boolean = false,
	capture?: string
): Promise<FileList | null> {
	return new Promise<FileList | null>((ok) => {
		const input = document.createElement('input')
		input.type = 'file'
		if (accept != null) input.accept = accept
		if (capture != null) input.capture = capture

		input.multiple = multiple
		input.click()

		input.onchange = () => {
			ok(input.files)
			input.remove()
		}
		input.oncancel = () =>{
			ok(null)
			input.remove()
		}
	})
}

export function downloadFile(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	downloadFileByUrl(url, filename)
	URL.revokeObjectURL(url)
}

export function readFileAsText(blob: Blob, encoding?: string): Promise<string> {
	return new Promise((ok) => {
		const reader = new FileReader()
		reader.readAsText(blob, encoding)
		reader.onload = (ev) => {
			const t = ev.target
			if (!t) return ok('');

			ok(t.result as string)
		}
		reader.onerror = () => ok('')
		reader.onabort = () => ok('')
	})
}
