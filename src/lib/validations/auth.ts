import { z } from "zod";

export const emailLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email." })
    .email({ message: "Địa chỉ email không đúng định dạng." })
    .max(255, { message: "Địa chỉ email quá dài." }),
});

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().min(6, { message: "Mã xác thực gồm tối thiểu 6 ký tự." }),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(100, { message: "Họ và tên tối đa 100 ký tự." })
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email." })
    .email({ message: "Địa chỉ email không đúng định dạng." })
    .max(255, { message: "Địa chỉ email quá dài." }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu cần tối thiểu 6 ký tự." })
    .max(100, { message: "Mật khẩu quá dài." }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email." })
    .email({ message: "Địa chỉ email không đúng định dạng." }),
  password: z
    .string()
    .min(1, { message: "Vui lòng nhập mật khẩu." }),
});

export type SignInPasswordInput = z.infer<typeof signInPasswordSchema>;


