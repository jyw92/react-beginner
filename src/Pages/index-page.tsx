import {AppDraftsDialog, AppSidebar} from '@/components/common';
import {SkeletonHotTopic} from '@/components/skeleton';
import {NewTopicCard} from '@/components/topics';
import {Button} from '@/components/ui';
import {generateErrorMessage} from '@/error';
import supabase from '@/lib/supabase';
import {useAuthStore} from '@/store';
import {TOPIC_STATUS, type Topic} from '@/types';
import {CircleSmall, NotebookPen, PencilLine} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {toast} from 'sonner';

export default function IndexPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicSaveChk, setTopicSaveChk] = useState<boolean>(false);
  const handleCategoryChange = (value: string) => {
    if (value === category) return; //선택된 항목 재선택시 무시
    if (value === '') {
      setSearchParams({});
    } else {
      setSearchParams({category: value});
    }
  };
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const query = supabase.from('topic').select('*').eq('status', TOPIC_STATUS.PUBLISH);
        if (category && category.trim() !== '') {
          query.eq('category', category);
        }
        const {data, error} = await query;

        if (error) {
          const message = generateErrorMessage(error);
          toast.error(message);
          return;
        }

        if (data) {
          setTopics(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTopics();
  }, [category]);

  useEffect(() => {
    const fetchSaveFetch = async () => {
      try {
        const {data, error} = await supabase
          .from('topic')
          .select('*') // 단순히 존재 여부만 체크한다면 select('id') 등이 더 가볍습니다.
          .eq('author', user?.id)
          .eq('status', TOPIC_STATUS.TEMP);

        if (error) {
          const message = generateErrorMessage(error);
          toast.error(message);
          return;
        }

        // data가 존재하고 길이가 0보다 클 때만 true
        if (data && data.length > 0) {
          setTopicSaveChk(true);
        } else {
          setTopicSaveChk(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    // user.id가 있을 때만 실행하도록 조건 추가 (선택사항)
    if (user?.id) {
      fetchSaveFetch();
    }
  }, [user?.id]);

  const handleRoute = async () => {
    if (!user) {
      toast.warning('토픽 작성은 로그인 후 가능합니다.');
      navigate('/sign-in');
      return;
    }

    const {data, error} = await supabase
      .from('topic')
      .insert([
        {
          status: null,
          title: null,
          content: null,
          category: null,
          thumbnail: null,
          author: user?.id,
        },
      ])
      .select();
    if (data) {
      toast.success('토픽을 생성하였습니다.');
      navigate(`/topics/${data[0].id}/create`);
    }
    if (error) {
      toast.error(error.message);
      return;
    }
  };
  return (
    <div className="w-full flex p-6 gap-6 h-full">
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 items-center flex gap-2">
        <Button variant={'destructive'} className="py-5! px-6! rounded-full" onClick={handleRoute}>
          <PencilLine />
          나만의 토픽 작성
        </Button>
        <AppDraftsDialog>
          <div className="relative">
            <Button className="rounded-full w-10 h-10" variant={'outline'}>
              <NotebookPen />
            </Button>
            {topicSaveChk && <CircleSmall className="absolute top-0 right-0 text-red-500" fill="#EF4444" size={14} />}
          </div>
        </AppDraftsDialog>
      </div>

      {/* container */}
      {/* 카테고리 사이드바 */}
      <div className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </div>
      {/* 토픽 콘텐츠 */}
      <section className="w-full lg:w-[calc(100% - 264px)] flex flex-col gap-12">
        {/* 핫토픽 */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src="/assets/gifs/gif-001.gif" alt="@IMG" className="w-7 h-7" />
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">HOT 토픽</h4>
            </div>
            <p className="text-muted-foreground md:text-base">
              지금 가장 주목받는 주제들은 살펴보고, 다양한 관점의 인사이트를 얻어보세요.
            </p>
          </div>
          <div className="w-full flex items-center gap-6 overflow-auto">
            <SkeletonHotTopic />
            <SkeletonHotTopic />
            <SkeletonHotTopic />
            <SkeletonHotTopic />
          </div>
        </div>

        {/* New 토픽 */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src="/assets/gifs/gif-003.gif" alt="@IMG" className="w-7 h-7" />
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">내 토픽</h4>
            </div>
            <p className="text-muted-foreground md:text-base">
              새로운 시선으로, 새로운 이야기를 시작하세요. 지금 바로 당신만의 토픽을 작성해보세요.
            </p>
          </div>
          {topics.length > 0 ? (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 min-h-120">
              {topics
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((topic: Topic) => {
                  return <NewTopicCard key={topic.id} props={topic} />;
                })}
            </div>
          ) : (
            <div className="w-full flex min-h-120 items-center justify-center">
              <p className="text-muted-foreground/50">조회 가능한 토픽이 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
