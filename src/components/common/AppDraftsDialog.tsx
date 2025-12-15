import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  Separator,
  DialogFooter,
  DialogClose,
  Button,
  Badge,
} from '@/components/ui';
import {generateErrorMessage} from '@/error';
import supabase from '@/lib/supabase';
import {useAuthStore} from '@/store';
import type React from 'react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import dayjs from 'dayjs';
import {TOPIC_STATUS, type Topic} from '@/types';
import {useNavigate} from 'react-router';

interface Props {
  children: React.ReactNode;
}

function AppDraftsDialog({children}: Props) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Topic[]>([]); // 타입 Any 대신 Topic[] 사용 권장

  // ✅ 수정됨: user.id가 변경되면(로그인 정보가 로드되면) 다시 실행되도록 의존성 추가
  useEffect(() => {
    const fetchDrafts = async () => {
      // 1. 유저 ID가 없으면 실행하지 않음
      if (!user?.id) {
        console.log('유저 ID가 없어 조회를 중단합니다.');
        return;
      }

      try {
        console.log('조회 시작:', {author: user.id, status: TOPIC_STATUS.TEMP});

        const {data: topics, error} = await supabase
          .from('topic')
          .select('*') // 명시적으로 * 적어주는 것이 좋습니다.
          .eq('author', user.id)
          .eq('status', TOPIC_STATUS.TEMP);

        if (error) {
          console.error('Supabase 에러:', error);
          const message = generateErrorMessage(error);
          toast.error(message);
          return;
        }

        console.log('조회된 데이터:', topics); // 여기서 [] 빈배열이면 RLS 문제

        if (topics) setDrafts(topics);
      } catch (error) {
        console.log(error);
      }
    };

    if (user?.id) fetchDrafts();
  }, [user?.id]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>임시 저장된 토픽</DialogTitle>
          <DialogDescription>임시 저장된 토픽 목록입니다. 이어서 작성하거나 삭제할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="flex items-center gap-2">
            <p>임시 저장</p>
            <p className="text-green-600 mr-1.5 text-base">{drafts.length}</p>
            <p>건</p>
          </div>
          <Separator />
          <div className="min-h-60 flex flex-col items-center justify-start gap-3 overflow-y-scroll h-60 scrollbar-hide">
            {drafts.length > 0 ? (
              drafts.map((draft: Topic, index: number) => {
                return (
                  <div
                    className="w-full flex items-center justify-between bg-card/50 py-2 px-4 gap-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      // Dialog 닫힘 처리 필요시 여기에 추가
                      navigate(`/topics/${draft.id}/create`);
                    }}
                    key={draft.id}
                  >
                    <div className="flex gap-2 items-center">
                      <Badge className="aspect-square bg-[#E26F24] hover:bg-[#E26F24] text-foreground h-5 w-5 rounded-sm flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm line-clamp-1">{draft.title || '등록된 제목이 없습니다.'}</p>
                        <p className="text-muted-foreground text-xs">
                          작성일: {dayjs(draft.created_at).format('YYYY. MM. DD')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={'outline'}>작성중</Badge>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                <p>조회 가능한 정보가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant={'outline'} className="border-0">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {AppDraftsDialog};
