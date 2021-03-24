import {Strategy as MiroStrategy} from './strategy'

describe('Strategy tests', () => {
	it('Should create strategy named miro', () => {
		const strategy = new MiroStrategy(
			{
				clientID: 'ABC12345',
				clientSecret: 'secret',
			},
			() => {},
		)

		expect(strategy.name).toStrictEqual('miro')
	})

	it('Should throw with no options', () => {
		//@ts-ignore
		expect(() => new MiroStrategy({}, () => {})).toThrow(Error)
	})

	describe('Behavior tests', () => {
		let verifyCallback: jest.Mock
		let passportActions: any
		let strategy: MiroStrategy
		let req: any

		beforeEach(() => {
			verifyCallback = jest.fn()
			passportActions = {
				success: jest.fn(),
				fail: jest.fn(),
				redirect: jest.fn(),
				pass: jest.fn(),
				error: jest.fn(),
			}
			strategy = new MiroStrategy(
				{
					clientID: 'ABC12345',
					clientSecret: 'secret',
					skipUserProfile: true,
				},
				verifyCallback,
			)
			Object.assign(strategy, passportActions)
			req = {
				method: 'GET',
				url: '/',
				headers: {},
			}
		})

		it('Should be redirected to proper url', () => {
			strategy.authenticate(req)
			expect(passportActions.redirect).toHaveBeenLastCalledWith(
				'https://miro.com/oauth/authorize?response_type=code&client_id=ABC12345',
			)
			strategy.authenticate(req, {teamId: '12345'})
			expect(passportActions.redirect).toHaveBeenLastCalledWith(
				'https://miro.com/oauth/authorize?team_id=12345&response_type=code&client_id=ABC12345',
			)
		})

		it('Should call verify callback for successful code exchange', () => {
			const accessToken = 'access_token'
			const refreshToken = 'refresh_token'
			const oauth2Mock = {
				getOAuthAccessToken: jest.fn(),
			}
			Object.assign(strategy, {_oauth2: oauth2Mock})

			req.query = {code: 'code_to_exchange'}
			oauth2Mock.getOAuthAccessToken.mockImplementationOnce((code: any, params: any, callback: any) => {
				callback(null, accessToken, refreshToken, {})
			})
			strategy.authenticate(req)
			expect(oauth2Mock.getOAuthAccessToken).toBeCalledTimes(1)
			expect(oauth2Mock.getOAuthAccessToken).toBeCalledWith(req.query.code, expect.anything(), expect.anything())
			expect(verifyCallback).toBeCalledTimes(1)
			expect(verifyCallback).toBeCalledWith(accessToken, refreshToken, undefined, expect.anything())
		})
	})
})
