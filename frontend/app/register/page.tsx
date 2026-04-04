"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid institutional email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "faculty"], { message: "Select a valid role" }),
  department: z.string().min(2, "Department is required")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError(null);
    try {
      const response = await api.post('/auth/register', data);
      login(response.data.accessToken, response.data.user);
    } catch (err) {
      const error = err as any;
      setGlobalError(error.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-6 bg-zinc-900 border border-border p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-muted-foreground text-sm">Join OpenScholar</p>
        </div>

        {globalError && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm text-center">
            {globalError}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
            <input
              type="text"
              {...register('fullName')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-zinc-950 text-white placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm ${
                errors.fullName ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
            />
            {errors.fullName && <p className="mt-1 text-sm text-error">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Institutional Email</label>
            <input
              type="email"
              {...register('email')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-zinc-950 text-white placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm ${
                errors.email ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Department</label>
            <input
              type="text"
              {...register('department')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-zinc-950 text-white placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm ${
                errors.department ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
              placeholder="e.g. Computer Science"
            />
            {errors.department && <p className="mt-1 text-sm text-error">{errors.department.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
            <select
              {...register('role')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-zinc-950 text-white placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm ${
                errors.role ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-error">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-zinc-950 text-white placeholder-muted-foreground focus:outline-none focus:ring-1 sm:text-sm ${
                errors.password ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
            />
            {errors.password && <p className="mt-1 text-sm text-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 mt-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
