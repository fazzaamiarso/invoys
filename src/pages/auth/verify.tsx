const VerifyEmail = () => {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="max-w-sm space-y-4 text-center">
        <h1 className="font-bold text-2xl ">Verify your email</h1>
        <p className="">
          We&apos;ve sent a verification link to your email to activate your
          account. <strong>The link expires in 24 hours.</strong>
        </p>
      </div>
    </main>
  );
};

VerifyEmail.isAuth = false;
export default VerifyEmail;
