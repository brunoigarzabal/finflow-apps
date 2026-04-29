import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { HTTPError } from 'ky'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLogin } from '@/api/auth'
import { GoogleLoginButton } from '@/modules/auth/components'
import { signInSchema, type SignInFormData } from '@/modules/auth/schemas'

export const SignInForm = () => {
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      await login.mutateAsync(data)
    } catch (error) {
      if (error instanceof HTTPError) {
        const body = await error.response.json<{ message?: string }>()
        setError('root', {
          message: body.message ?? 'Credenciais inválidas',
        })
      }
    }
  }

  return (
    <Fragment>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
          <CardDescription>Entre com sua conta Apple ou Google</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <GoogleLoginButton
                  setError={(message) => setError('root', { message })}
                />
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continue com
              </FieldSeparator>
              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pr-10"
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-haspopup="true"
                    className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground active:bg-transparent active:not-aria-[haspopup]:translate-y-0"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <HugeiconsIcon
                      icon={showPassword ? ViewOffIcon : EyeIcon}
                      className="size-4"
                    />
                    <span className="sr-only">
                      {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={login.isPending}>
                  {login.isPending ? 'Entrando...' : 'Entrar'}
                </Button>
                <FieldDescription className="text-center">
                  Não tem uma conta? <Link to="/sign-up">Cadastre-se</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Fragment>
  )
}
