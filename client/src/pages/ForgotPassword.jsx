import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { RouteSignIn } from '@/helpers/RouteName'
import { showToast } from '@/helpers/showToast'
import { getEvn } from '@/helpers/getEnv'
import logo from '@/assets/images/logo-white.png'

const ForgotPassword = () => {
    const [submitted, setSubmitted] = useState(false)

    const formSchema = z.object({
        email: z.string().email('Please enter a valid email address.'),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '' },
    })

    async function onSubmit(values) {
        try {
            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            setSubmitted(true)
            showToast('success', data.message)
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
                <h1 className='text-2xl font-bold text-center mb-2'>Forgot Password</h1>

                {submitted ? (
                    <div className='text-center mt-4'>
                        <p className='text-green-600 font-medium mb-2'>Check your inbox!</p>
                        <p className='text-sm text-gray-500 mb-5'>
                            A password reset link has been sent to your email address. The link expires in 15 minutes.
                        </p>
                        <Link className='text-blue-500 hover:underline text-sm' to={RouteSignIn}>
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className='text-sm text-gray-500 text-center mb-5'>
                            Enter your account email and we&apos;ll send you a link to reset your password.
                        </p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className='mb-4'>
                                    <FormField
                                        control={form.control}
                                        name='email'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder='Enter your email address' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='mt-5'>
                                    <Button type='submit' className='w-full'>
                                        Send Reset Link
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

export default ForgotPassword
