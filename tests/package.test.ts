import { Strategy as MiroStrategy } from '..'
import Strategy from '..'

describe('passport-miro package tests', () => {
	it('should export Strategy constructor', () => {
		expect(MiroStrategy.Strategy).toBeInstanceOf(Function)
	})

	it('should export Strategy constructor as module (default)', () => {
		expect(Strategy).toBeInstanceOf(Function)
		expect(Strategy).toStrictEqual(MiroStrategy.Strategy)
	})
})
