import { z } from 'zod';

/** Aligns with Firebase Email/Password defaults while keeping a slightly stricter floor (8). */
export const emailPasswordSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;

export const registerSchema = emailPasswordSchema
  .extend({
    confirmPassword: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterForm = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Informe um e-mail válido'),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
