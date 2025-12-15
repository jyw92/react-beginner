import {generateErrorMessage} from '@/error';
import supabase from '@/lib/supabase';
import {useAuthStore} from '@/store';
import {useEffect} from 'react';
import {useNavigate} from 'react-router';
import {toast} from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const {data: listener} = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        console.error('세션에 사용자 정보가 없습니다.');
        return;
      }

      const user = session.user;
      if (!user.id) {
        console.error('유저 ID가 없습니다.');
        return;
      }

      try {
        const {data: existing, error: selectError} = await supabase
          .from('user')
          .select('id')
          .eq('id', user.id)
          .single();

        if (selectError) {
          const message = generateErrorMessage(selectError);
          toast.error(message);
          return;
        }
        if (!existing) {
          const {error: insertError} = await supabase
            .from('user')
            .insert([
              {id: user.id, email: user.email, service_agreed: true, privacy_agreed: true, marketing_agreed: false},
            ]);
          if (insertError) {
            const message = generateErrorMessage(insertError);
            toast.error(message);
            return;
          }
        }

        setAuth({
          id: user.id,
          email: user.email || '알 수 없는 사용자',
          role: user.role || '',
        });
        navigate('/');
      } catch (error) {
        console.error(error);
      }
    });

    //언마운트 시 , 구독해지
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <div className="w-full h-full min-h-[720px] flex items-center justify-center">로그인을 진행 중입니다.</div>;
}
