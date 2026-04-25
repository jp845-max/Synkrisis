import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndFetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          const user = await setTokenAndFetchUser(token);
          if (user && !user.profileCompleted) {
            navigate('/complete-profile');
          } else {
            navigate('/dashboard');
          }
        } catch (err: any) {
          setError('Authentication failed. Please try again.');
          toast.error('Authentication failed');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError('No token found in URL.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    authenticate();
  }, [searchParams, navigate, setTokenAndFetchUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {error ? (
        <div className="text-red-500 font-medium">{error}</div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-b mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      )}
    </div>
  );
}
