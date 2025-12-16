-- 1단계: 기존 트리거와 함수 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2단계: 안전한 함수 및 트리거 재생성 (id와 email만 삽입)
create or replace function public.handle_new_user()
returns trigger 
language plpgsql
security definer set search_path = public
as $$
begin
  -- ⚠️ 주의: id와 email만 삽입하여 중복 키 충돌을 방지합니다.
  insert into public.user (id, email)
  values (new.id, new.email);
  
  return new;
end;
$$;

-- auth.users 테이블에 새 행이 삽입된 '직후'에 함수를 실행
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();