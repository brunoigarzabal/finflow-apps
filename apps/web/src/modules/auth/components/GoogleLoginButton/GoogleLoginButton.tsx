import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { HTTPError } from 'ky'
import { Fragment } from 'react'

import { useGoogleLogin } from '@/api/auth'

type Props = {
  setError: (message: string) => void
}

export const GoogleLoginButton = ({ setError }: Props) => {
  const googleLoginMutation = useGoogleLogin()

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return
    try {
      await googleLoginMutation.mutateAsync({ idToken: response.credential })
    } catch (error) {
      if (error instanceof HTTPError) {
        const body = await error.response.json<{ message?: string }>()
        setError(body.message ?? 'Falha no login com Google')
      }
    }
  }

  return (
    <Fragment>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Falha no login com Google')}
        width="100%"
        shape="pill"
        theme="outline"
        text="continue_with"
        logo_alignment="center"
        containerProps={{ className: 'w-full' }}
      />
    </Fragment>
  )
}
