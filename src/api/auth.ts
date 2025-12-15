import supabase from '@/lib/supabase';

// 1. 회원가입 및 로그인 타입 (ID 없음, 동의 여부 없음)
type AuthCredentials = {
  email: string;
  password: string;
};

// 2. 정보 저장용 타입 (ID 필수, 동의 여부 필수)
type AuthAgreed = {
  userId: string;
  serviceAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  email: string;
};

// 함수 1: 회원가입
export async function signUp({email, password}: AuthCredentials) {
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// 함수 2: 정보 저장
export async function signUpAgreed({userId, serviceAgreed, privacyAgreed, marketingAgreed, email}: AuthAgreed) {
  const {error} = await supabase.from('user').insert({
    id: userId,
    service_agreed: serviceAgreed,
    privacy_agreed: privacyAgreed,
    marketing_agreed: marketingAgreed,
    email: email,
  });
  if (error) throw error;
}

// 함수 3: 로그인
export async function signInWidthPassword({email, password}: AuthCredentials) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}
