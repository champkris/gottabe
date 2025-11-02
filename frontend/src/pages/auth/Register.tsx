import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Package, Store } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface RegisterFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
  address: string
  role: 'customer' | 'merchant'
  business_name?: string
  business_description?: string
  business_email?: string
  business_phone?: string
  business_address?: string
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<'customer' | 'merchant'>('customer')
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'customer',
    },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await registerUser({
        ...data,
        role: accountType,
      })
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2">
            <Package className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold">Marketplace</span>
          </Link>
          <p className="mt-2 text-gray-600">Create your account and start shopping</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Account Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccountType('customer')}
                    className={`p-4 border-2 rounded-lg transition ${
                      accountType === 'customer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">Customer</p>
                    <p className="text-xs text-gray-600">Buy products</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('merchant')}
                    className={`p-4 border-2 rounded-lg transition ${
                      accountType === 'merchant'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Store className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">Merchant</p>
                    <p className="text-xs text-gray-600">Sell products</p>
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </label>
                    <div className="relative">
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        {...register('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters',
                          },
                        })}
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        {...register('phone', {
                          required: 'Phone number is required',
                        })}
                      />
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Address *
                    </label>
                    <div className="relative">
                      <Input
                        id="address"
                        placeholder="123 Main St, City"
                        className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                        {...register('address', {
                          required: 'Address is required',
                        })}
                      />
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                        })}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="password_confirmation" className="text-sm font-medium">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        placeholder="Confirm password"
                        className={`pl-10 pr-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                        {...register('password_confirmation', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === password || 'Passwords do not match',
                        })}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500">
                        {errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information (only for merchants) */}
              {accountType === 'merchant' && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Business Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business Name */}
                    <div className="space-y-2">
                      <label htmlFor="business_name" className="text-sm font-medium">
                        Business Name *
                      </label>
                      <Input
                        id="business_name"
                        placeholder="My Store"
                        {...register('business_name', {
                          required: accountType === 'merchant' ? 'Business name is required' : false,
                        })}
                      />
                      {errors.business_name && (
                        <p className="text-sm text-red-500">{errors.business_name.message}</p>
                      )}
                    </div>

                    {/* Business Email */}
                    <div className="space-y-2">
                      <label htmlFor="business_email" className="text-sm font-medium">
                        Business Email *
                      </label>
                      <Input
                        id="business_email"
                        type="email"
                        placeholder="store@example.com"
                        {...register('business_email', {
                          required: accountType === 'merchant' ? 'Business email is required' : false,
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      {errors.business_email && (
                        <p className="text-sm text-red-500">{errors.business_email.message}</p>
                      )}
                    </div>

                    {/* Business Phone */}
                    <div className="space-y-2">
                      <label htmlFor="business_phone" className="text-sm font-medium">
                        Business Phone *
                      </label>
                      <Input
                        id="business_phone"
                        type="tel"
                        placeholder="(555) 987-6543"
                        {...register('business_phone', {
                          required: accountType === 'merchant' ? 'Business phone is required' : false,
                        })}
                      />
                      {errors.business_phone && (
                        <p className="text-sm text-red-500">{errors.business_phone.message}</p>
                      )}
                    </div>

                    {/* Business Address */}
                    <div className="space-y-2">
                      <label htmlFor="business_address" className="text-sm font-medium">
                        Business Address *
                      </label>
                      <Input
                        id="business_address"
                        placeholder="456 Business Ave"
                        {...register('business_address', {
                          required: accountType === 'merchant' ? 'Business address is required' : false,
                        })}
                      />
                      {errors.business_address && (
                        <p className="text-sm text-red-500">{errors.business_address.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Business Description */}
                  <div className="space-y-2">
                    <label htmlFor="business_description" className="text-sm font-medium">
                      Business Description *
                    </label>
                    <textarea
                      id="business_description"
                      placeholder="Tell us about your business..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register('business_description', {
                        required: accountType === 'merchant' ? 'Business description is required' : false,
                      })}
                    />
                    {errors.business_description && (
                      <p className="text-sm text-red-500">{errors.business_description.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-primary"
                  required
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Sign In Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/auth/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
