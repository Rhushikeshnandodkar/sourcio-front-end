"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { verifyEmail } from "@/lib/auth";
import Beams from "@/components/Beams";
import Link from "next/link";

const verifySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Verification code must contain only numbers"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const emailFromQuery = searchParams.get("email") || "";

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: emailFromQuery,
      code: "",
    },
  });

  // Update email field when query param changes
  useEffect(() => {
    if (emailFromQuery) {
      form.setValue("email", emailFromQuery);
    }
  }, [emailFromQuery, form]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (values: VerifyFormValues) => {
    setIsLoading(true);
    form.clearErrors("root");

    try {
      await verifyEmail(values.email, values.code);
      
      // Get redirect URL from query params or default to home
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    } catch (error) {
      console.error("Verification error:", error);
      form.setError("root", {
        message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Beams Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>

      {/* Form Overlay - Centered */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-white mb-2 tracking-tight">Verify Your Email</h1>
            <p className="text-sm text-white/70 font-medium">Enter the 6-digit code sent to your email</p>
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white mb-2.5">Verification Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="pl-12 pr-12 h-12 border-white/10 bg-white/80 text-white placeholder:text-white/70 focus:ring-0 focus:ring-offset-0 transition-all rounded-lg text-center text-2xl tracking-widest font-mono"
                          {...field}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
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
                {isLoading || authLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-white/70">
                  Didn't receive the code?{" "}
                  <Link href="/signup" className="text-white font-semibold hover:text-white/80 transition-colors">
                    Sign up again
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
