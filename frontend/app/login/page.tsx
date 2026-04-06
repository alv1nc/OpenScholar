"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid institutional email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.accessToken, response.data.user);
    } catch (err) {
      const error = err as any;
      setGlobalError(error.response?.data?.error || "Login failed. Please check credentials.");
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 bg-white border border-border p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex justify-center items-center font-serif text-white text-2xl mx-auto mb-4">O</div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground text-sm">
            Sign in to your OpenScholar account
          </p>
        </div>

        {globalError && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm text-center">
            {globalError}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Institutional Email</label>
            <input
              type="email"
              {...register('email')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm transition-colors ${
                errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-border focus:ring-primary focus:border-primary'
              }`}
              placeholder="you@university.edu"
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm transition-colors ${
                errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-border focus:ring-primary focus:border-primary'
              }`}
            />
            {errors.password && <p className="mt-1 text-sm text-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-foreground transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
