import {CaseSensitive} from 'lucide-react';
import {Card, Separator} from '../ui';
import type {Topic} from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {useNavigate} from 'react-router';
import supabase from '@/lib/supabase';
import {generateErrorMessage} from '@/error';
import {toast} from 'sonner';
import {useEffect, useState} from 'react';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface Props {
  props: Topic;
}

async function findUserById(id: string) {
  try {
    const {data: user, error} = await supabase.from('user').select('*').eq('id', id);
    if (error) {
      const message = generateErrorMessage(error);
      toast.error(message);
    }
    console.log('user=================', user);
    if (user && user.length > 0) {
      return user[0].email.split('@')[0] + '님';
    } else {
      return '알 수 없는 사용자';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function extractTextFromContent(content: string | string[], maxChars = 200) {
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (!Array.isArray(parsed)) {
      console.warn('content 데이터 타입이 배열이 아닙니다.');
      return;
    }

    let result = '';
    for (const block of parsed) {
      if (Array.isArray(block.content)) {
        for (const child of block.content) {
          if (child?.text) {
            result += child.text + ' ';
            if (result.length >= maxChars) return result.slice(0, maxChars) + '...';
          }
        }
      }
    }
    return result.trim();
  } catch (error) {
    console.log('콘텐츠 파싱 실패:', error);
  }
}

function NewTopicCard({props}: Props) {
  const naivgate = useNavigate();
  const [nickname, setNickname] = useState<string>('');
  useEffect(() => {
    async function fetchAuthEmail() {
      const email = await findUserById(props.author);
      setNickname(email || '알 수 없는 사용자');
    }
    fetchAuthEmail();
  }, []);

  console.log('Props', props);
  const {created_at, title, thumbnail, content, id} = props;
  return (
    <Card className="w-full p-4 gap-4 h-fit cursor-pointer" onClick={() => naivgate(`/topics/${id}/detail`)}>
      <div className="flex items-start gap-4">
        <div className="flex items-start gap-4 flex-1 flex-col">
          {/* 썸네일과 제목 */}
          <h3 className="h-16 text-base font-semibold tracking-tight line-clamp-2">
            <CaseSensitive size={16} className="text-muted-foreground" />
            <p>{title}</p>
          </h3>
          {/* 본문 */}
          <p className="line-clamp-3 text-muted-foreground">{extractTextFromContent(content)}</p>
        </div>

        <img src={thumbnail} alt="@THUMBNAIL" className="w-[140px] h-[140px] aspect-square rounded-lg object-cover" />
      </div>
      <Separator />
      <div className="w-full flex items-center justify-between">
        <p>{nickname}</p>
        <p>
          {dayjs(created_at).format('YYYY. MM. DD')} - ({dayjs(created_at).fromNow()})
        </p>
      </div>
    </Card>
  );
}

export {NewTopicCard};
