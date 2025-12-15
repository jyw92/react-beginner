import {Route, Routes} from 'react-router';
import GlobalLayout from './components/layout/global-layout';
import IndexPage from './Pages/index-page';
import CreateTopic from './Pages/topics/[id]/create';
import SignIn from './Pages/sign-in';
import SignUp from './Pages/sign-up';
import DetailTopic from './Pages/topics/[id]/detail';
import Portfolio from './Pages/portfolio';
import AuthCallback from './Pages/auth/callback'; //소셜 로그인 시, 콜백 페이지

export default function RootRouter() {
  return (
    <Routes>
      <Route element={<GlobalLayout />}>
        <Route path="/" element={<IndexPage />} />
        <Route path="/topics/:id/create" element={<CreateTopic />} />
        <Route path="/topics/:id/detail" element={<DetailTopic />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Route>
    </Routes>
  );
}
