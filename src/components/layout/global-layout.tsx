import useAuthListener from '@/hooks/use-auth';
import {AppHeader} from '../common';
import {Outlet} from 'react-router';

export default function GlobalLayout() {
  useAuthListener();
  return (
    <div className="page" style={{position: 'relative'}}>
      <AppHeader />
      <main className="container">
        <Outlet />
      </main>
      {/* <AppFooter /> */}
    </div>
  );
}
