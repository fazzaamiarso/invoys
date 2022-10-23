import Button from '@components/Button';
import TextInput from '@components/Form/TextInput';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { GetServerSidePropsContext } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

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
  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = useForm<{ emailTo: string }>();
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const isVerifying = isSubmitSuccessful && !verificationError;

  const onSubmit: SubmitHandler<{ emailTo: string }> = async data => {
    const res = await signIn('email', {
      email: data.emailTo,
      callbackUrl: '/',
    });
    if (res?.error) setVerificationError(res.error);
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      {!isVerifying && (
        <div className="max-w-lg">
          <h1 className="text-xl font-bold">Login / Signup</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
            {verificationError && (
              <div className="bg-red-100 text-red-500 p-2 rounded-sm w-full">
                {verificationError}
              </div>
            )}
            <TextInput
              label="Email Address"
              name="emailTo"
              register={register}
            />
            <Button
              type="submit"
              variant="primary"
              Icon={ArrowRightOnRectangleIcon}>
              Login or Signup
            </Button>
          </form>
        </div>
      )}
    </main>
  );
};

Login.isAuth = false;

export default Login;
