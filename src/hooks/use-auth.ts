import supabase from '@/lib/supabase';
import {useAuthStore} from '@/store';
import {useEffect} from 'react';

export default function useAuthListener() {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession();
      if (session) {
        setAuth({
          id: session.user.id,
          email: session.user.email as string,
          role: session.user.role as string,
        });
      }
    };
    checkSession();

    //실시간 상태 변화 감지
    const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth({
          id: session.user.id,
          email: session.user.email as string,
          role: session.user.role as string,
        });
      } else {
        setAuth(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);
}
