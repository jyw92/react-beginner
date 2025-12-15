import {NavLink, useNavigate} from 'react-router';
import {Separator} from '../ui';
import {useAuthStore} from '@/store';
import {toast} from 'sonner';

function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.clearAuth);

  // const logoutHandler = () => {
  //   if (confirm('정말 로그아웃 하시겠습니까?')) {
  //     logout();
  //     navigate('/');
  //     return;
  //   }
  // };

  const handleLogout = async () => {
    try {
      if (confirm('정말 로그아웃 하시겠습니까?')) {
        await logout(); //zustand + supabase 모두 로그아웃
        navigate('/sign-in');
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="fixed top-0 w-full flex items-center justify-center bg-[#121212] z-20">
      <div className="w-full max-w-[1328px] flex items-center justify-between px-6 py-3">
        {/* 로고 & 네비게이션 UI */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-5">
            <NavLink to="/" className="font-semibold cursor-pointer flex items-center gap-2">
              <img
                src="https://github.com/9diin.png"
                alt="@LOGO"
                className="w-6 h-6 cursor-pointer"
                onClick={() => navigate('/')}
              />
              토픽 인사이트
            </NavLink>
            <Separator orientation="vertical" className="h-4!" />
            <NavLink to={'/portfolio'} className="font-semibold cursor-pointer">
              포트폴리오
            </NavLink>
          </div>
        </div>
        {/* 로그인 UI */}
        {/* <div
          className="font-semibold text-muted-foreground hover:text-white transition-all duration-500 cursor-pointer"
          onClick={() => navigate('/sign-in')}
        >
          로그인
        </div> */}
        {/* <Link
          to="/sign-in"
          className="ont-semibold text-muted-foreground hover:text-white transition-all duration-500 cursor-pointer"
        >
          로그인
        </Link> */}

        {user ? (
          <div className="flex items-center gap-5">
            <span>{user.email}</span>
            <Separator orientation="vertical" className="h-4!" />
            <span onClick={handleLogout} className="cursor-pointer">
              로그아웃
            </span>
          </div>
        ) : (
          <NavLink
            to="/sign-in"
            className="font-semibold text-muted-foreground hover:text-white transition-all duration-500 cursor-pointer"
          >
            로그인
          </NavLink>
        )}
      </div>
    </header>
  );
}
export {AppHeader};
