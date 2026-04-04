import { httpClient } from '@/lib/httpClient'

import { AUTH_ENDPOINTS } from './config'
import type {
  GoogleLoginBody,
  LoginBody,
  RegisterBody,
  TokenResponse,
  ProfileResponse,
} from './types'

export const login = (body: LoginBody) =>
  httpClient
    .unauthorized()
    .post(AUTH_ENDPOINTS.login, { json: body })
    .json<TokenResponse>()

export const register = (body: RegisterBody) =>
  httpClient
    .unauthorized()
    .post(AUTH_ENDPOINTS.register, { json: body })
    .json<TokenResponse>()

export const googleLogin = (body: GoogleLoginBody) =>
  httpClient
    .unauthorized()
    .post(AUTH_ENDPOINTS.google, { json: body })
    .json<TokenResponse>()

export const getProfile = () =>
  httpClient.authorized().get(AUTH_ENDPOINTS.profile).json<ProfileResponse>()

export const logout = () =>
  httpClient
    .authorized()
    .post(AUTH_ENDPOINTS.logout)
    .json<{ success: boolean }>()
