import OAuth2Strategy from 'passport-oauth2'
import type {Request} from 'express'
import fetch from 'node-fetch'
import MiroTokenError from './errors/MiroTokenError'
import MiroRestApiError from './errors/MiroRestApiError'

interface UserObject {
	type: 'user'
	id: string
	role?: string
	email?: string
	industry?: string
	createdAt?: string
	company?: string
	picture?: {
		type: 'picture',
		imageUrl: string,
		id: string
	}
	name?: string
	state?: string
}

interface _StrategyOptionsBase extends OAuth2Strategy._StrategyOptionsBase {
	/**
	 * Miro REST API version (v1 by default)
	 */
	apiVersion?: string
	/**
	 * REST API URL to get user profile
	 */
	profileUrl?: string
	/**
	 * Profile fields to get
	 */
	profileFields?: (keyof Omit<UserObject, 'type' | 'id'>)[]
	/**
	 * Pick the specific team in authorization form.
	 * Is ignored if provided teamIdQueryParamName
	 */
	teamId?: string
	/**
	 * Use incoming request's query param value to pick the specific team in authorization form
	 */
	teamIdQueryParamName?: string
}

export interface AuthenticateOptions {
	/**
	 * Pick the specific team in authorization form.
	 */
	teamId?: string
	[_: string]: any
}

export interface StrategyOptions extends _StrategyOptionsBase {
	passReqToCallback: false
}
export interface StrategyOptionsWithRequest extends _StrategyOptionsBase {
	passReqToCallback: true
}

export class Strategy extends OAuth2Strategy.Strategy {
	static readonly Strategy = Strategy

	private readonly teamId: string | undefined
	private readonly teamIdQueryParamName: string | undefined
	private readonly profileUrl: string

	constructor(verify: OAuth2Strategy.VerifyFunction)
	constructor(options: StrategyOptions, verify: OAuth2Strategy.VerifyFunction)
	constructor(options: StrategyOptionsWithRequest, verify: OAuth2Strategy.VerifyFunctionWithRequest)
	constructor(arg1: any, arg2?: any) {
		const options = (typeof arg1 === 'function' ? {} : arg1 || {}) as _StrategyOptionsBase
		const verify = typeof arg1 === 'function' ? arg1 : arg2

		options.apiVersion = options.apiVersion || 'v1'
		options.authorizationURL = options.authorizationURL || 'https://miro.com/oauth/authorize'
		options.tokenURL = options.tokenURL || `https://api.miro.com/${options.apiVersion}/oauth/token`

		super(options, verify)
		this.name = 'miro'
		this.teamId = options.teamId
		this.teamIdQueryParamName = options.teamIdQueryParamName
		this.profileUrl = options.profileUrl || `https://api.miro.com/${options.apiVersion}/users/me`
	}

	authenticate(req: Request, options?: AuthenticateOptions): void {
		const ongoingTeamId = this.getOngoingTeamId(req, options)
		if (ongoingTeamId) {
			options = {...options, teamId: ongoingTeamId}
		}
		super.authenticate(req, options)
	}

	authorizationParams(options: AuthenticateOptions): object {
		const queryParams: any = {}
		if (options.teamId) {
			queryParams.team_id = options.teamId
		}
		return queryParams
	}

	async userProfile(accessToken: string, done: (err?: Error | null, profile?: UserObject) => void) {
		const profileResponse = await fetch(this.profileUrl, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			}
		})

		if (!profileResponse.ok) {
			let errJson
			try {
				errJson = await profileResponse.json()
			} catch (e: any) {}

			if (errJson && errJson.type === 'error') {
				done(new MiroRestApiError(errJson.status, errJson.code, errJson.message, errJson.context, errJson.type))
			} else {
				done(new Error(`Failed to fetch user profile: ${profileResponse.statusText}`))
			}
		} else {
			let profileJson
			try {
				profileJson = await profileResponse.json()
				done(null, profileJson)
			} catch (e: any) {
				done(new Error(`Failed to parse user profile: ${e.message}`))
			}
		}
	}

	parseErrorResponse(body: any, status: number): Error | null {
		const json = JSON.parse(body)
		if (json.type === 'error') {
			return new MiroTokenError(json.status, json.code, json.message, json.context, json.type)
		}
		return super.parseErrorResponse(body, status)
	}

	private getOngoingTeamId(req: Request, options?: AuthenticateOptions): string | undefined {
		if (options?.teamId) {
			return options.teamId
		}

		if (this.teamIdQueryParamName) {
			return req.query[this.teamIdQueryParamName].toString()
		}

		return this.teamId
	}
}

export default Strategy
