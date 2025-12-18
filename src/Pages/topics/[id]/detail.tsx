import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  BlockNote,
  Button,
  Separator,
} from '@/components/ui';
import {generateErrorMessage} from '@/error';
import supabase from '@/lib/supabase';
import {ArrowLeft, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {toast} from 'sonner';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {useAuthStore} from '@/store';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export default function DetailTopic() {
  const navigate = useNavigate();
  const {id} = useParams();
  const user = useAuthStore((state) => state.user);

  const [author, setAuthor] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const fetchTopic = async () => {
      // id가 없으면 실행하지 않음 (선택 사항)
      if (!id) return;

      try {
        const {data, error} = await supabase.from('topic').select('*').eq('id', id).single(); // <--- 핵심 수정: 배열 대신 단일 객체로 반환받습니다.

        if (error) {
          const message = generateErrorMessage(error);
          toast.error(message);
          return;
        }

        // data가 존재할 때만 상태 업데이트
        if (data) {
          setAuthor(data.author);
          setTitle(data.title);
          setCategory(data.category);
          setThumbnail(data.thumbnail);
          setCreatedAt(data.created_at);
          setContent(data.content);
          // // ★ 핵심: content(JSON 문자열)를 파싱해서 에디터에 주입
          // if (data.content) {
          //   try {
          //     // 1. DB에 저장된 문자열(String)을 JSON 객체 배열로 변환
          //     const parsedBlocks = JSON.parse(data.content) as Block[];

          //     // 2. 에디터의 기존 내용을 지우고 가져온 블록으로 교체
          //     editor.replaceBlocks(editor.document, parsedBlocks);
          //   } catch (e) {
          //     console.error('블록 파싱 실패:', e);
          //   }
          // }
        }
      } catch (error) {
        console.log(error);
        // 여기서 throw를 하면 useEffect 내부라 잡히지 않을 수 있습니다.
        // toast 처리를 하거나 로깅만 하는 것이 좋습니다.
      }
    };

    fetchTopic();
  }, [id]);
  const handleDelete = async () => {
    try {
      // [추가된 로직] 1. 썸네일이 존재한다면 스토리지에서 파일 삭제
      if (thumbnail) {
        // DB에는 전체 Public URL이 저장되어 있습니다.
        // 예: https://.../storage/v1/object/public/files/topics/abc.png
        // 여기서 'files/' 뒷부분인 'topics/abc.png'만 추출해야 삭제가 가능합니다.

        const imagePath = thumbnail.split('/files/')[1];

        if (imagePath) {
          const {error: storageError} = await supabase.storage
            .from('files') // CreateTopic에서 사용한 버킷 이름
            .remove([imagePath]); // 삭제할 경로는 배열 형태여야 함

          if (storageError) {
            console.error('이미지 삭제 중 오류 발생:', storageError);
            // 이미지를 못 지웠다고 해서 게시글 삭제를 막을지, 그냥 넘어갈지는 선택 사항입니다.
            // 여기서는 로그만 남기고 게시글 삭제를 진행합니다.
          }
        }
      }

      // 2. DB 테이블 데이터 삭제 (기존 로직)
      const {error} = await supabase.from('topic').delete().eq('id', id);

      if (error) {
        const message = generateErrorMessage(error);
        toast.error(message);
        return;
      } else {
        toast.success('토픽을 삭제하였습니다.');
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      toast.error('삭제 처리 중 오류가 발생했습니다.');
    }
  };
  return (
    <main className="w-full h-full min-h-[720px] flex p-6 gap-6 flex-col ">
      <div
        className="relative w-full h-60 md:h-100 bg-cover bg-accent bg-position-[50%_35%]"
        style={{backgroundImage: `url(${thumbnail})`}}
      >
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <Button size={'icon'} variant={'outline'} onClick={() => navigate('/')}>
            <ArrowLeft />
          </Button>
          {/* 토픽을 작성한 사람의 user_id와 로그인한 사람의 user_id가 같은 경우에만 보이도록 한다. */}
          {author === user?.id && (
            <AlertDialog>
              <AlertDialogTrigger>
                <Button size={'icon'} variant={'outline'} className="bg-red-800/50!">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 해당 토픽을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    삭제하시면 해당 토픽의 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>닫기</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-800/50 text-foreground hover:bg-red-700/50"
                    onClick={handleDelete}
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0a] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-linear-to-l from-[#0a0a0a] via-transparent to-transparent"></div>
      </div>
      <section className="relative w-full flex flex-col items-center -mt-4">
        <span className="mb-4"># {category}</span>
        <h1 className="scroll-m-20 text-center font-extrabold  tracking-tight sm:text-2xl text-xl md:text-4xl">
          {title}
        </h1>
        <Separator className="w-6! my-6 bg-foreground" />
        <span>
          {dayjs(createdAt).format('YYYY. MM. DD')} - ({dayjs(createdAt).fromNow()})
        </span>
      </section>
      <div className="w-full py-6 detail-editor-wrap">
        {content && <BlockNote props={JSON.parse(content)} readonly />}
      </div>
    </main>
  );
}
