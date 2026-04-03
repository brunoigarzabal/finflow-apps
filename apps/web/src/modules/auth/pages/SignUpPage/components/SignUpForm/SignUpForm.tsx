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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { HTTPError } from 'ky'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'

import { useRegister } from '@/api/auth'
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
          message: responseBody.message ?? 'Registration failed',
        })
      }
    }
  }

  return (
    <Fragment>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {errors.root && <FieldError>{errors.root.message}</FieldError>}
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                      Confirm Password
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
                  Must be at least 6 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending
                    ? 'Creating account...'
                    : 'Create Account'}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/sign-in">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </Fragment>
  )
}
