"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "@/navigation"
import { Eye, EyeOff, BookOpen } from "lucide-react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { useAuthModals } from "@/hooks/use-auth-modals"
import { registerSchema } from "@/lib/validation/auth"

export function RegisterModal() {
  const [showPassword, setShowPassword] = useState(false)
  const { register, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { registerOpen, closeRegister, switchToLogin } = useAuthModals()
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = registerSchema.safeParse(value)
        if (result.success) {
          return null
        }

        const flattened = result.error.flatten()
        return {
          form: flattened.formErrors[0],
          fields: {
            username: flattened.fieldErrors.username?.[0],
            email: flattened.fieldErrors.email?.[0],
            password: flattened.fieldErrors.password?.[0],
            confirmPassword: flattened.fieldErrors.confirmPassword?.[0],
          },
        }
      },
    },
    onSubmit: async ({ value }) => {
      const result = await register(value.username, value.email, value.password)

      if (result?.success) {
        toast({
          title: "Verify your email",
          description: `We sent a confirmation link to ${value.email}. Please verify before signing in.`,
        })
        closeRegister()
        switchToLogin()
        return
      }

      toast({
        title: "Registration failed",
        description: result?.message || "Username or email already exists",
        variant: "destructive",
      })
    },
  })

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Google sign up failed",
        description: "Unable to retrieve Google credentials",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await loginWithGoogle(credentialResponse.credential)
      if (response?.success) {
        toast({ title: "Signed in with Google", description: "Welcome to Novel VIP!" })
        closeRegister()
        router.refresh()
      } else {
        toast({
          title: "Google sign up failed",
          description: response?.message || "Unable to complete Google authentication",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      const message = error?.message || "Unable to authenticate with Google"
      toast({ title: "Google sign up failed", description: message, variant: "destructive" })
    }
  }

  const handleGoogleError = () => {
    toast({
      title: "Google sign up failed",
      description: "The Google window was closed or an error occurred",
      variant: "destructive",
    })
  }

  return (
    <Dialog open={registerOpen} onOpenChange={closeRegister}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <DialogTitle>Create Account</DialogTitle>
          </div>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Username</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Choose a username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                />
                {!field.state.meta.isValid ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Enter your email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                />
                {!field.state.meta.isValid ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {!field.state.meta.isValid ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Confirm Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="Confirm your password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                />
                {!field.state.meta.isValid ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.errorMap]}
            children={([canSubmit, isSubmitting, errorMap]) => (
              <>
                {errorMap.onSubmit ? <p className="text-sm text-destructive">{String(errorMap.onSubmit)}</p> : null}
                <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </>
            )}
          />
        </form>

        {googleEnabled && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className={form.state.isSubmitting ? "pointer-events-none opacity-60" : ""}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} width="100%" />
            </div>
          </div>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button type="button" onClick={switchToLogin} className="text-primary hover:underline font-medium">
            Sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
