import supabase from '@/lib/supabase';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

// 1. 반복해서 쓰이는 User 타입을 밖으로 뺐습니다.
type UserInfo = {
  id: string;
  email: string;
  role: string;
};

interface AuthStore {
  user: UserInfo | null;
  setAuth: (user: UserInfo | null) => void;
  clearAuth: () => Promise<void>;
}

// 중요: create<AuthStore>()(...) 패턴을 사용해야 타입 에러가 안 납니다.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // 초기 상태
      user: {
        id: '',
        email: '',
        role: '',
      },

      // 로그인 시
      setAuth: (newUser: UserInfo | null) => set({user: newUser}),

      // 로그아웃 시
      clearAuth: async () => {
        await supabase.auth.signOut();
        // 1. 상태 초기화
        set({user: null}); //zustand 상태 초기화

        // 2. 스토리지 삭제 (선택사항)
        // 사실 set으로 초기화하면 자동으로 스토리지도 초기화된 값으로 덮어씌워지므로
        // 아래 줄은 굳이 없어도 되지만, 아예 키를 날리고 싶다면 이렇게 씁니다.
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({user: state.user}),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
