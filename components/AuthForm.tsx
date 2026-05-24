"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { FormType } from "@/types";
import { getErrorMessage } from "@/lib/errors";
import Image from "next/image";
import Link from "next/link";

const OAUTH_BASE = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  try {
    const origin = new URL(apiUrl).origin;
    return `${origin}/api/auth`;
  } catch {
    return "http://localhost:3001/api/auth";
  }
})();

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white">
    <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const authFormSchema = (type: FormType) => {
  const schema = z.object({
    name:
      type === "sign-up"
        ? z.string().min(3, "Name must be at least 3 characters.")
        : z.string().optional(),
    email: z.email("Please enter a valid email address."),
    password: z.string().min(3, "Password must be at least 3 characters."),
    confirmPassword:
      type === "sign-up"
        ? z.string().min(1, "Please confirm your password.")
        : z.string().optional(),
  });

  if (type === "sign-up") {
    return schema.refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });
  }

  return schema;
};

const AuthForm = ({ type, dictionary: t }: { type: FormType, dictionary?: any }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const result = await signUp({
          name: name!,
          email,
          password,
        });

        if (!result?.success) {
          toast.error(getErrorMessage(result, "Could not sign up. Please try again."));
          return;
        }

        toast.success(t?.auth?.signUpSuccess || "Account created successfully!");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const result = await signIn({ email, password });

        if (!result?.success) {
          toast.error(getErrorMessage(result, "Could not sign in. Please try again."));
          return;
        }

        toast.success(t?.auth?.signInSuccess || "Signed in successfully!");
        router.push("/preparation");
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Something went wrong. Please try again."));
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-141.5">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>

        <h3>{t?.auth?.subtitle || "Practice job interviews with AI"}</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label={t?.auth?.nameLabel || "Name"}
                placeholder={t?.auth?.namePlaceholder || "Your Name"}
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label={t?.auth?.emailLabel || "Email"}
              placeholder={t?.auth?.emailPlaceholder || "Your email address"}
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label={t?.auth?.passwordLabel || "Password"}
              placeholder={t?.auth?.passwordPlaceholder || "Enter your password"}
              type="password"
            />

            {!isSignIn && (
              <FormField
                control={form.control}
                name="confirmPassword"
                label={t?.auth?.confirmPasswordLabel || "Confirm password"}
                placeholder={
                  t?.auth?.confirmPasswordPlaceholder || "Re-enter your password"
                }
                type="password"
              />
            )}

            {isSignIn && (
              <div className="flex justify-end -mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button className="btn" type="submit">
              {isSignIn ? (t?.auth?.signInBtn || "Sign In") : (t?.auth?.signUpBtn || "Create an Account")}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? (t?.auth?.noAccount || "No account yet?") : (t?.auth?.haveAccount || "Have an account already?")}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? (t?.auth?.signInBtn || "Sign In") : (t?.auth?.signUpBtn || "Sign Up")}
          </Link>
        </p>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" style={{ borderColor: "var(--surface-border)" }}></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3" style={{ color: "var(--text-muted)", background: "var(--surface-card)" }}>Or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`${OAUTH_BASE}/google`} className="w-full">
            <Button variant="outline" className="btn-oauth">
              <GoogleIcon />
              <span>Google</span>
            </Button>
          </Link>

          <Link href={`${OAUTH_BASE}/github`} className="w-full">
            <Button variant="outline" className="btn-oauth">
              <GithubIcon />
              <span>GitHub</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
