import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from '@/components/ui';
import {NavLink, useNavigate} from 'react-router';
import {useSignIn} from '@/hooks/mutations/auth/use-sign-in';
import {generateErrorMessage} from '@/error';
import {toast} from 'sonner';
import {useAuthStore} from '@/store';
import supabase from '@/lib/supabase';
import {useEffect} from 'react';

const formSchema = z.object({
  email: z.email({
    error: '올바른 양식의 이메일주소를 입력하세요.',
  }),
  password: z.string().min(8, {
    error: '비밀번호는 최소 8자 이상이어야합니다.',
  }),
});

export default function SignIn() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {mutateAsync: signIn, isPending: isSignInPending} = useSignIn({
    onError: (error) => {
      const message = generateErrorMessage(error);
      toast.error(message);
    },
    onSuccess: (data) => {
      const {user, session} = data;

      if (user && session) {
        setAuth({
          id: user.id || '',
          email: user.email || '',
          role: user.role || '',
        });
      }

      toast.success('로그인을 성공하셨습니다. 환영합니다!');
      navigate('/');
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // const {email, password} = values;
    // try {
    //   const authResult = await signIn({email, password});
    //   const {user, session} = authResult;
    //   const userId = user?.id;
    //   const userEmail = user?.email;
    //   const userRole = user?.role;

    //   if (user && session) {
    //     setId(userId);
    //     setEmail(userEmail as string);
    //     setRole(userRole as string);
    //   }
    // } catch (error) {
    //   console.log(error);
    //   throw new Error(`${error}`);
    // }
    // try-catch와 로직을 훅 내부나 onSuccess로 위임하여 코드가 훨씬 간결해집니다.
    await signIn(values);
  }

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
        navigate('/');
      }
    };
    checkSession();
  }, []);

  const handleGoogleSignIn = async () => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {access_type: 'offline', prompt: 'consent'},
        redirectTo: `${import.meta.env.VITE_SUPABASE_BASE_URL}/auth/callback`, //로그인 후 돌아올 url https://localhost:5173
      },
    });

    if (error) {
      const message = generateErrorMessage(error);
      toast.error(message);
      return;
    }
  };

  return (
    <div className="w-full h-full min-h-[720px] flex p-6 gap-6 justify-center items-center">
      <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">로그인</h4>
          <p className="text-muted-foreground">로그인을 위한 정보를 입력해주세요.</p>
        </div>
        <div className="grid gap-3">
          <Button type="button" variant={'secondary'} onClick={handleGoogleSignIn}>
            <img src="/assets/icons/social/google.svg" alt="@GOOGLE-LOGO" className="w-[18px] h-[18px] mr-1" />
            구글 로그인
          </Button>
          {/* 경계선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-muted-foreground bg-black uppercase">OR CONTINUE WITH</span>
            </div>
          </div>
          {/* 로그인폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="이메일을 입력하세요." {...field} disabled={isSignInPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="비밀번호를 입력하세요."
                        type="password"
                        {...field}
                        disabled={isSignInPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button type="submit" variant={'outline'} className="flex-1 bg-sky-800/50!" disabled={isSignInPending}>
                  로그인
                </Button>
                <div className="text-center">
                  계정이 없으신가요?{' '}
                  <NavLink to={'/sign-up'} className="underline ml-1">
                    회원가입
                  </NavLink>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
