import { GetServerSidePropsContext } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import logo from '@assets/invoys.webp';
import { LoadingSpinner } from '@components/Spinner';

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session?.user) return { props: {} };
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

const Login = () => {
  const { register, handleSubmit, formState } = useForm<{ emailTo: string }>();
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const onSubmit: SubmitHandler<{ emailTo: string }> = async data => {
    if (formState.isSubmitting) return;
    const res = await signIn('email', {
      email: data.emailTo,
      callbackUrl: '/',
    });
    if (res?.error) setVerificationError(res.error);
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="max-w-sm space-y-4 ring-1 ring-gray-200 p-6 rounded-md">
        <div className="text-center flex flex-col items-center">
          <div className="w-28 pb-4">
            <Image src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Log in with Email</h1>
          <p className="text-sm">
            Enter your email address and we&apos;ll send you a login link. In
            the future, be sure to use the same email to pick up where you left
            off.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
          {verificationError && (
            <div className="bg-red-100 text-red-500 p-2 rounded-sm w-full">
              {verificationError}
            </div>
          )}
          <label htmlFor="emailTo" className="w-full">
            <input
              type="text"
              {...register('emailTo', { required: true })}
              id="emailTo"
              placeholder="example@gmail.com"
              className="w-full rounded-md border-gray-300"
            />
          </label>
          <button className="bg-primary justify-center text-white hover:bg-[#393bc3] transition-all disabled:bg-[#292b91] flex items-center gap-2 rounded-md w-full px-4 py-2">
            {formState.isSubmitting ? (
              <LoadingSpinner twWidth="w-7" />
            ) : (
              'Send me a link'
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

Login.isAuth = false;

export default Login;
