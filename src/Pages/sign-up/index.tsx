import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
} from '@/components/ui';
import {NavLink, useNavigate} from 'react-router';
import {ArrowLeft, Asterisk, ChevronRight} from 'lucide-react';
import {Separator} from '@radix-ui/react-separator';
import {useState} from 'react';
import {toast} from 'sonner';
import {useSignUp} from '@/hooks/mutations/auth/use-sign-up';
import {generateErrorMessage} from '@/error';

import {useSignUpAgreed} from '@/hooks/mutations/auth/use-sign-up-agreed';

const formSchema = z
  .object({
    email: z.email({
      error: '올바른 양식의 이메일주소를 입력하세요.',
    }),
    password: z.string().min(8, {
      error: '비밀번호는 최소 8자 이상이어야합니다.',
    }),
    confirmPassword: z.string().min(8, {
      error: '비밀번호 확인을 입력해주세요.',
    }),
  })
  .superRefine(({password, confirmPassword}, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: '비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
      });
    }
  });

export default function SignUp() {
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [serviceAgreed, setServiceAgreed] = useState<boolean>(false);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [marketingAgreed, setMarketingAgreed] = useState<boolean>(false);

  const {mutateAsync: signUp, isPending: isSignUpPending} = useSignUp();
  const {mutateAsync: signUpAgreed, isPending: isSignUpAgreedPending} = useSignUpAgreed();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {email, password} = values;

    // 1. 유효성 검사N
    if (!serviceAgreed || !privacyAgreed) {
      toast.warning('필수 동의항목을 체크해주세요.');
      return;
    }

    // SignUp.tsx 내부

    try {
      console.log('1. 회원가입 시작');
      const authResult = await signUp({email, password});

      const userId = authResult.user?.id;
      console.log('2. 회원가입 성공, ID 확보:', userId);

      if (!userId) throw new Error('ID 없음');

      console.log('3. DB 저장 시작');
      await signUpAgreed({
        userId, // API 함수 매개변수 이름과 일치시킴
        serviceAgreed,
        privacyAgreed,
        marketingAgreed,
        email,
      });
      console.log('4. DB 저장 성공');

      toast.success('회원가입을 완료하였습니다.');
      navigate('/sign-in');
    } catch (error) {
      // 콘솔창(F12)을 열어서 이 로그를 확인하세요!
      console.error('🚨 에러 발생 위치 확인:', error);

      const message = generateErrorMessage(error);
      toast.error(message);
    }
  }
  const isPending = isSignUpPending || isSignUpAgreedPending;
  const handleCheckMarketing = () => setMarketingAgreed(!marketingAgreed);
  const handleCheckService = () => setServiceAgreed(!serviceAgreed);
  const handleCheckPrivacy = () => setPrivacyAgreed(!privacyAgreed);

  return (
    <div className="w-full h-full min-h-[720px] flex p-6 gap-6 justify-center items-center">
      <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">회원가입</h4>
          <p className="text-muted-foreground">회원가입을 위한 정보를 입력해주세요.</p>
        </div>
        <div className="grid gap-3">
          {/* 회원가입폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="이메일을 입력하세요." {...field} disabled={isPending} />
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
                      <Input placeholder="비밀번호를 입력하세요." {...field} type="password" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="비밀번호 확인을 입력하세요."
                        {...field}
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Asterisk size={14} className="text-[#f96859]" />
                    <Label>필수 동의항목</Label>
                  </div>
                  <div className="flex flex-col">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          className="w-[18px] h-[18px]"
                          checked={serviceAgreed}
                          onCheckedChange={handleCheckService}
                          disabled={isPending}
                        />
                        서비스 이용약관 동의
                      </div>
                      <Button type="button" variant={'link'} className="p-0! gap-1">
                        <p className="text-xs">자세히보기</p>
                        <ChevronRight className="mt-0.5" />
                      </Button>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          className="w-[18px] h-[18px]"
                          checked={privacyAgreed}
                          onCheckedChange={handleCheckPrivacy}
                          disabled={isPending}
                        />
                        개인정보 수집 및 이용동의
                      </div>
                      <Button type="button" variant={'link'} className="p-0! gap-1">
                        <p className="text-xs">자세히보기</p>
                        <ChevronRight className="mt-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>선택 동의항목</Label>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        className="w-[18px] h-[18px]"
                        checked={marketingAgreed}
                        onCheckedChange={handleCheckMarketing}
                        disabled={isPending}
                      />
                      마케팅 및 광고 수신 동의
                    </div>
                    <Button type="button" variant={'link'} className="p-0! gap-1" disabled={isPending}>
                      <p className="text-xs">자세히보기</p>
                      <ChevronRight className="mt-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <Button type="button" variant={'outline'} size={'icon'}>
                    <ArrowLeft />
                  </Button>
                  <Button type="submit" variant={'outline'} className="flex-1 bg-green-800/50!">
                    회원가입
                  </Button>
                </div>
                <div className="text-center">
                  이미 계정이 있으신가요?
                  <NavLink to={'/sign-in'} className="underline ml-1">
                    로그인
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
