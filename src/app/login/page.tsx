'use client';
import FormInput from '@/components/Accounts/FormInput';
import { AuthContext, AuthContextType } from '@/components/ContextProviders/AuthContext';
import { emailValidation, loginPasswordValidation } from '@/lib/schemas';
import { APIError, errorToast, successToast } from '@/lib/utils';
import { Github } from 'lucide-react';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import Link from 'next/link';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

const GOOGLE_LOGO_URL: string = process.env.NEXT_PUBLIC_GOOGLE_LOGO as string;
const GOOGLE_OAUTH_ENDPOINT: string = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENDPOINT as string;
const GITHUB_OAUTH_ENDPOINT: string = process.env.NEXT_PUBLIC_GITHUB_OAUTH_ENDPOINT as string;

const LoginPage = (): React.JSX.Element => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const router: AppRouterInstance = useRouter();
  const authContext = useContext<AuthContextType | undefined>(AuthContext);

  /*
    Clears the login error after navigating away from the login page.
    This makes it so the stale error is not still displayed on the login form later.
  */
  useEffect(() => {
    return () => {
      authContext?.clearLoginError();
    };
  }, []);

  /*
    Handles OAuth login success and errors.
  */
  useEffect(() => {
    const handleOAuthLogin = async () => {
      try {
        const status: string | null = searchParams.get('status');
        const provider: string | null = searchParams.get('provider');

        if (status === 'success') {
          await authContext?.updateSessionContext('login');
          successToast('Login Successful', 'Enjoy your stay. Share your faves.');
          router.replace('/');
        } else if (status === 'fail') {
          throw new APIError(`Error connecting to ${provider}. Please try again later.`, 500);
        } else {
          return;
        }
      } catch (error) {
        if (error instanceof APIError) {
          errorToast('Authentication error.', error.message);
        } else {
          errorToast('Authentication error.', 'There was an error authenticating this user.');
        }
        router.replace('/login');
      }
    };
    handleOAuthLogin();
  }, [searchParams, router]);

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({ mode: 'onChange' });

  const onSubmit: SubmitHandler<FieldValues> = async (e: FieldValues) => {
    await authContext?.login(e);
  };

  return (
    <div className="flex h-full w-full grow items-center justify-center">
      <div className="my-4 flex w-[400px] flex-col rounded-md border-2 p-4">
        <h1 className="text-accent mb-4 text-xl">Login</h1>
        {authContext?.loginError && (
          <p className="m-0 mb-4 text-red-600">{authContext?.loginError}</p>
        )}
        <form className="flex grow flex-col" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            register={register}
            name="email"
            label="Email Address"
            options={emailValidation}
            validationError={errors.email}
          />
          <FormInput
            register={register}
            name="password"
            label="Password"
            options={loginPasswordValidation}
            validationError={errors.password}
          />
          <button
            className="border-accent mx-auto mt-1 mb-4 flex w-fit cursor-pointer items-center rounded-2xl border-2 p-4 disabled:cursor-default"
            type="submit"
            disabled={!isValid}
          >
            Login
          </button>
        </form>
        <div className="flex w-full flex-col items-center gap-2 text-[hsl(var(--text-color))]">
          <p>
            Need an account?{' '}
            <Link href="/register" className="text-accent">
              Register here.
            </Link>
          </p>
          <p className="text-[14px]">Or log in with</p>
          <div className="flex w-full items-center justify-evenly">
            <Link
              href={`${GOOGLE_OAUTH_ENDPOINT}?source=login`}
              className="flex w-[25%] flex-col items-center justify-center gap-2 p-2"
            >
              <Image
                width={24}
                height={24}
                alt="Google G Logo"
                src={GOOGLE_LOGO_URL}
                loading="lazy"
              ></Image>
              <p className="text-[14px]">Google</p>
            </Link>
            <Link
              href={`${GITHUB_OAUTH_ENDPOINT}?source=login`}
              className="flex w-[25%] flex-col items-center justify-center gap-2 p-2"
            >
              <Github width={24} height={24} />
              <p className="text-[14px]">GitHub</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
