import { useRouter } from 'next/router';
import invariant from 'tiny-invariant';

const AuthError = () => {
  const router = useRouter();
  const { error } = router.query;

  if (!router.isReady) return null;
  invariant(typeof error === 'string', 'Error code should be a string');

  const errMessage =
    error === 'AccessDenied'
      ? "You don't hace access to this app. Please message the owner to request an invitation."
      : 'Authentication Error';
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="max-w-sm space-y-4 text-center">
        <h1 className="font-bold text-2xl ">Authentication Error</h1>
        <p className="">{errMessage}</p>
      </div>
    </main>
  );
};

AuthError.isAuth = false;
export default AuthError;
