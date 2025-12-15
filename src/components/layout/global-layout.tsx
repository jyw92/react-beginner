import useAuthListener from '@/hooks/use-auth';
import {AppFooter, AppHeader} from '../common';
import {Outlet} from 'react-router';

export default function GlobalLayout() {
  useAuthListener();
  return (
    <div className="page">
      <AppHeader />
      <main className="container">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
