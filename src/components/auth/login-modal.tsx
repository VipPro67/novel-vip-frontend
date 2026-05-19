"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "@/navigation"
import { Eye, EyeOff, BookOpen } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { useAuthModals } from "@/hooks/use-auth-modals"
import { loginSchema } from "@/lib/validation/auth"

export function LoginModal() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { loginOpen, closeLogin, switchToRegister } = useAuthModals()
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = loginSchema.safeParse(value)
        if (result.success) {
          return null
        }

        const flattened = result.error.flatten()
        return {
          form: flattened.formErrors[0],
          fields: {
            email: flattened.fieldErrors.email?.[0],
            password: flattened.fieldErrors.password?.[0],
          },
        }
      },
    },
    onSubmit: async ({ value }) => {
      const response = await login(value.email, value.password)

      if (response?.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        closeLogin()
        router.refresh()
        return
      }

      console.error("Login failed:", response?.message)
      toast({
        title: "Login failed",
        description: response?.message || "Invalid email or password",
        variant: "destructive",
      })
    },
  })

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Google login failed",
        description: "Unable to retrieve Google credentials",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await loginWithGoogle(credentialResponse.credential)
      if (response?.success) {
        toast({ title: "Login successful", description: "Welcome back!" })
        closeLogin()
        router.refresh()
      } else {
        toast({
          title: "Google login failed",
          description: response?.message || "Unable to authenticate with Google",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      const message = error?.message || "Unable to authenticate with Google"
      toast({ title: "Google login failed", description: message, variant: "destructive" })
    }
  }

  const handleGoogleError = () => {
    toast({
      title: "Google login failed",
      description: "The Google sign-in popup was closed or an error occurred",
      variant: "destructive",
    })
  }

  return (
    <Dialog open={loginOpen} onOpenChange={closeLogin}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <DialogTitle>Welcome Back</DialogTitle>
            </div>
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
                    placeholder="Enter your password"
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.errorMap]}
            children={([canSubmit, isSubmitting, errorMap]) => (
              <>
                {errorMap.onSubmit ? <p className="text-sm text-destructive">{String(errorMap.onSubmit)}</p> : null}
                <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
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
              <div className="flex justify-center">
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} width="100%" />
                </GoogleOAuthProvider>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <button type="button" onClick={switchToRegister} className="text-primary hover:underline font-medium">
            Sign up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
