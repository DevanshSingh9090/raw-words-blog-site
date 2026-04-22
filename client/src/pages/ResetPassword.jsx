import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RouteSignIn } from '@/helpers/RouteName'
import { showToast } from '@/helpers/showToast'
import { getEvn } from '@/helpers/getEnv'
import logo from '@/assets/images/logo-white.png'

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [success, setSuccess] = useState(false)

    const formSchema = z
        .object({
            password: z.string().min(6, 'Password must be at least 6 characters.'),
            confirmPassword: z.string().min(6, 'Please confirm your password.'),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match.",
            path: ['confirmPassword'],
        })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { password: '', confirmPassword: '' },
    })

    async function onSubmit(values) {
        try {
            const response = await fetch(
                `${getEvn('VITE_API_BASE_URL')}/auth/reset-password/${token}`,
                {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ password: values.password }),
                }
            )
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            setSuccess(true)
            showToast('success', data.message)
            setTimeout(() => navigate(RouteSignIn), 3000)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    return (
        <div className='flex justify-center items-center h-screen w-screen'>
            <Card className='w-[400px] p-5'>
                <div className='flex justify-center items-center mb-2'>
                    <Link to='/'>
                        <img src={logo} />
                    </Link>
                </div>
                <h1 className='text-2xl font-bold text-center mb-2'>Reset Password</h1>

                {success ? (
                    <div className='text-center mt-4'>
                        <p className='text-green-600 font-medium mb-2'>Password updated!</p>
                        <p className='text-sm text-gray-500 mb-5'>
                            Your password has been reset successfully. Redirecting you to sign in…
                        </p>
                        <Link className='text-blue-500 hover:underline text-sm' to={RouteSignIn}>
                            Go to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className='text-sm text-gray-500 text-center mb-5'>
                            Enter your new password below.
                        </p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className='mb-3'>
                                    <FormField
                                        control={form.control}
                                        name='password'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='password'
                                                        placeholder='Enter new password'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <FormField
                                        control={form.control}
                                        name='confirmPassword'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='password'
                                                        placeholder='Re-enter new password'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='mt-5'>
                                    <Button type='submit' className='w-full'>
                                        Reset Password
                                    </Button>
                                    <div className='mt-4 text-sm flex justify-center items-center gap-2'>
                                        <Link className='text-blue-500 hover:underline' to={RouteSignIn}>
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </Card>
        </div>
    )
}

export default ResetPassword
