export type LoginBody = {
  email: string
  password: string
}

export type GoogleLoginBody = {
  idToken: string
}

export type RegisterBody = {
  name: string
  email: string
  password: string
}

export type TokenResponse = {
  token: string
}

export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  hasPassword: boolean
  googleLinked: boolean
}

export type ProfileResponse = {
  user: User
}

export type ChangeEmailBody = {
  email: string
  password: string
}

export type ChangePasswordBody = {
  currentPassword?: string
  newPassword: string
}

export type SuccessResponse = {
  success: boolean
}
