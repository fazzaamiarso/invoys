import Button from '@components/Button';
import TextInput from '@components/Form/TextInput';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signIn } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';

const Login = () => {
  const { register, handleSubmit } = useForm<{ emailTo: string }>();

  const onSubmit: SubmitHandler<{ emailTo: string }> = data => {
    signIn('email', { email: data.emailTo, callbackUrl: '/' });
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div>
        <h1 className="text-xl font-bold">Login / Signup</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
          <TextInput label="Email Address" name="emailTo" register={register} />
          <Button
            type="submit"
            variant="primary"
            Icon={ArrowRightOnRectangleIcon}>
            Login or Signup
          </Button>
        </form>
      </div>
    </main>
  );
};

Login.isAuth = false;

export default Login;
