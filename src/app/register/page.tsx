'use client';
import FormInput from '@/components/Accounts/FormInput';
import { AuthContextType, AuthContext } from '@/components/ContextProviders/AuthContext';
import {
  confirmPasswordValidation,
  emailValidation,
  registrationPasswordValidation,
} from '@/lib/schemas';
import { Github } from 'lucide-react';
import Link from 'next/link';
import React, { useContext, useEffect } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { APIError, errorToast, successToast } from '@/lib/utils';

const GOOGLE_LOGO_URL: string = process.env.NEXT_PUBLIC_GOOGLE_LOGO as string;
const GOOGLE_OAUTH_ENDPOINT: string = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENDPOINT as string;
const GITHUB_OAUTH_ENDPOINT: string = process.env.NEXT_PUBLIC_GITHUB_OAUTH_ENDPOINT as string;

const RegistrationPage = (): React.JSX.Element => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const router: AppRouterInstance = useRouter();
  const authContext = useContext<AuthContextType | undefined>(AuthContext);

  /*
      Clears the registration error after navigating away from the registration page.
      This makes it so the stale error is not still displayed on the registration form later.
    */
  useEffect(() => {
    return () => {
      authContext?.clearRegistrationError();
    };
  }, []);

  /*
      Handles OAuth registration/login success and errors.
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
        router.replace('/register');
      }
    };
    handleOAuthLogin();
  }, [searchParams, router]);

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    watch,
  } = useForm({ mode: 'onChange' });

  // Watch the 'password' field to compare with the 'confirm password' field.
  const passwordInput = watch('password');

  const onSubmit: SubmitHandler<FieldValues> = async (e: FieldValues) => {
    await authContext?.register(e);
  };

  return (
    <div className="flex h-full w-full grow items-center justify-center">
      <div className="my-4 flex w-[400px] flex-col rounded-md border-2 p-4">
        <h1 className="text-accent mb-4 text-xl">Register</h1>
        {authContext?.registrationError && (
          <p className="m-0 mb-4 text-red-600">{authContext?.registrationError}</p>
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
            options={registrationPasswordValidation}
            validationError={errors.password}
          />
          <FormInput
            register={register}
            name="confirmPassword"
            label="Confirm Password"
            options={confirmPasswordValidation(passwordInput)}
            validationError={errors.confirmPassword}
          />
          <button
            className="border-accent mx-auto mt-1 mb-4 flex w-fit cursor-pointer items-center rounded-2xl border-2 p-4 disabled:cursor-default"
            type="submit"
            disabled={!isValid}
          >
            Create account
          </button>
        </form>
        <div className="flex w-full flex-col items-center gap-2 text-[hsl(var(--text-color))]">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-accent">
              Login here.
            </Link>
          </p>
          <p className="text-[14px]">Or register in with</p>
          <div className="flex w-full items-center justify-evenly">
            <Link
              href={`${GOOGLE_OAUTH_ENDPOINT}?source=register`}
              className="flex w-[25%] flex-col items-center justify-center gap-2 rounded-2xl p-2"
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
              href={`${GITHUB_OAUTH_ENDPOINT}?source=register`}
              className="flex w-[25%] flex-col items-center justify-center gap-2 rounded-2xl p-2"
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

export default RegistrationPage;
