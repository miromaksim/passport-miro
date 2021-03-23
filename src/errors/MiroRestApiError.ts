export default class MiroRestApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		public message: string,
		public context: any,
		public type: string,
	) {
		super(message)
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = 'MiroRestApiError'
	}
}
