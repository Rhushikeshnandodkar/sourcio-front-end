"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import Beams from "@/components/Beams";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password cannot exceed 128 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    form.clearErrors("root");

    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        // Get redirect URL from query params or default to home
        const redirectTo = searchParams.get("redirect") || "/";
        router.push(redirectTo);
      } else {
        form.setError("root", {
          message: result.message || "Invalid email or password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Beams Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#ffffff" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
      </div>

      {/* Form Overlay - Centered */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-white mb-2 tracking-tight">Welcome Back to Sourcio</h1>
            <p className="text-sm text-white/70 font-medium">Sign in to your account to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white mb-2.5">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-12 pr-12 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-semibold text-white mb-2.5">Password</FormLabel>
                      <button type="button" className="text-white/70 hover:text-white transition-colors text-sm">
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-12 pr-12 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="rounded-lg bg-red-50/90 backdrop-blur-sm border border-red-200/50 p-4 text-white">
                  <p className="text-sm text-red-700 font-medium">{form.formState.errors.root.message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full h-12 font-semibold text-base mt-8 rounded-lg shadow-lg hover:shadow-xl transition-all bg-white text-black hover:bg-white/90"
              >
                {isLoading || authLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-white/70">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-white font-semibold hover:text-white/80 transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
