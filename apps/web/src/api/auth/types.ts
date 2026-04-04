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
}

export type ProfileResponse = {
  user: User
}
