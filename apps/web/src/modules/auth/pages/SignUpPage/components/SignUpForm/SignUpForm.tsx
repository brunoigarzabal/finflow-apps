import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
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
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'

import { useRegister } from '@/api/auth'
import { GoogleLoginButton } from '@/modules/auth/components'
import { signUpSchema, type SignUpFormData } from '@/modules/auth/schemas'

export const SignUpForm = () => {
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    const { confirmPassword: _, ...body } = data
    try {
      await registerMutation.mutateAsync(body)
    } catch (error) {
      if (error instanceof HTTPError) {
        const responseBody = await error.response.json<{ message?: string }>()
        setError('root', {
          message: responseBody.message ?? 'Falha no cadastro',
        })
      }
    }
  }

  return (
    <Fragment>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crie sua conta</CardTitle>
          <CardDescription>
            Preencha seus dados abaixo para criar sua conta
          </CardDescription>
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
                Ou continue com e-mail
              </FieldSeparator>
              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
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
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      aria-invalid={!!errors.password}
                      {...register('password')}
                    />
                    {errors.password && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmar senha
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      aria-invalid={!!errors.confirmPassword}
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <FieldError>{errors.confirmPassword.message}</FieldError>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Deve ter pelo menos 6 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending
                    ? 'Criando conta...'
                    : 'Criar conta'}
                </Button>
                <FieldDescription className="text-center">
                  Já tem uma conta? <Link to="/sign-in">Entrar</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Fragment>
  )
}
