import {AppFileUpload} from '@/components/common';
import {
  BlockNote,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {TOPIC_CATEGORY} from '@/constants/category.constant';
import supabase from '@/lib/supabase';
import {useAuthStore} from '@/store';
import type {Block} from '@blocknote/core';
import {ArrowLeft, Asterisk, BookOpenCheck, ImageOff, Save} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {toast} from 'sonner';
import {nanoid} from 'nanoid';
import {generateErrorMessage} from '@/error';
import {TOPIC_STATUS} from '@/types';

export default function CreateTopic() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const {id} = useParams();
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<Block[]>();
  const [category, setCategory] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<File | string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const {data: topic, error} = await supabase.from('topic').select('*').eq('id', id).single();

        if (error) {
          const message = generateErrorMessage(error);
          toast.error(message);
          return;
        }

        if (topic) {
          const {title, content, category, thumbnail} = topic;

          setTitle(title);
          setContent(JSON.parse(content));
          setCategory(category);
          setThumbnail(thumbnail);
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    };
    fetchTopic();
  }, []);

  const handleSave = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!title && !content && category && !thumbnail) {
      toast.warning('제목, 본문, 카테고리, 썸네일을 기입하세요..');
      return;
    }

    //1. 파일 업로드 시, Supabase의 Storage 즉 , bucket 폴더에 이미지를 먼저 업로드 한 후
    //이미지가 저장된 bucket 폴더의 경로 URL 주소를 우리가 관리하고 있는 Topic 테이블 thumbnail 컬럼에 문자열 형태
    //즉, string 타입 (DB에서는 Text 타입)으로 저장한다.
    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail instanceof File) {
      //썸네일 이미지를 storage에 업로드
      const fileExt = thumbnail.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `topics/${fileName}`;
      const {error: uploadError} = await supabase.storage.from('files').upload(filePath, thumbnail);

      if (uploadError) throw uploadError;
      //업로드된 이미지의 public url값 가져오기
      const {data} = await supabase.storage.from('files').getPublicUrl(filePath);
      if (!data) throw new Error('썸네일 Public URL 조회를 실패하였습니다.');
      thumbnailUrl = data.publicUrl;
    } else if (typeof thumbnail === 'string') {
      thumbnailUrl = thumbnail;
    }

    const {data, error} = await supabase
      .from('topic')
      .update([
        {
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user.id,
          status: TOPIC_STATUS.TEMP,
        },
      ])
      .eq('id', id)
      .select();
    if (data) {
      toast.success('작성 중인 토픽을 저장하였습니다.');
      return;
    }
    if (error) {
      toast.error(error.message);
      return;
    }
  };
  const handlePublish = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!title && !content && category && !thumbnail) {
      toast.warning('제목, 본문, 카테고리, 썸네일을 기입하세요..');
      return;
    }

    //1. 파일 업로드 시, Supabase의 Storage 즉 , bucket 폴더에 이미지를 먼저 업로드 한 후
    //이미지가 저장된 bucket 폴더의 경로 URL 주소를 우리가 관리하고 있는 Topic 테이블 thumbnail 컬럼에 문자열 형태
    //즉, string 타입 (DB에서는 Text 타입)으로 저장한다.
    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail instanceof File) {
      //썸네일 이미지를 storage에 업로드
      const fileExt = thumbnail.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `topics/${fileName}`;
      const {error: uploadError} = await supabase.storage.from('files').upload(filePath, thumbnail);

      if (uploadError) throw uploadError;
      //업로드된 이미지의 public url값 가져오기
      const {data} = await supabase.storage.from('files').getPublicUrl(filePath);
      if (!data) throw new Error('썸네일 Public URL 조회를 실패하였습니다.');
      thumbnailUrl = data.publicUrl;
    } else if (typeof thumbnail === 'string') {
      thumbnailUrl = thumbnail;
    }

    const {data, error} = await supabase
      .from('topic')
      .update([
        {
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user.id,
          status: TOPIC_STATUS.PUBLISH,
        },
      ])
      .eq('id', id)
      .select();
    if (data) {
      toast.success('토픽을 발행하였습니다.');
      navigate('/');
      return;
    }
    if (error) {
      toast.error(error.message);
      return;
    }
  };

  return (
    <div className="w-full h-full min-h-[1024px] flex gap-6">
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2">
        <Button variant={'outline'} size={'icon'} onClick={() => navigate('/')}>
          <ArrowLeft />
        </Button>
        <Button type="button" variant={'outline'} className="w-22 bg-yellow-800/50!" onClick={handleSave}>
          <Save />
          저장
        </Button>
        <Button type="button" variant={'outline'} className="w-22 bg-emerald-800/50!" onClick={handlePublish}>
          <BookOpenCheck />
          발행
        </Button>
      </div>
      {/* 토픽 작성하기 */}
      <section className="w-3/4 h-full flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#f96859] font-semibold">Step 01</span>
          <span className="font-semibold tet-base">토픽작성하기</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {/* <Asterisk className="w-3.5 h-3.5 text-[#f96859]" /> */}
            <Asterisk size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">제목</Label>
          </div>
          <Input
            placeholder="토픽 제목을 입력하세요."
            className="h-16 pl-6 placeholder:text-lg placeholder:font-semibold border-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {/* <Asterisk className="w-3.5 h-3.5 text-[#f96859]" /> */}
            <Asterisk size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">본문</Label>
          </div>
          {/* <Skeleton className="w-full h-100" /> */}
          {/* BlockNote Text Editor UI */}
          <BlockNote setContent={setContent} props={content} />
        </div>
      </section>
      {/* 카테고리 및 썸네일 등록 */}
      <section className="w-1/4 h-full flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#f96859] font-semibold">Step 02</span>
          <span className="font-semibold tet-base">카테고리 및 썸네일 등록</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {/* <Asterisk className="w-3.5 h-3.5 text-[#f96859]" /> */}
            <Asterisk size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">카테고리</Label>
          </div>
          <Select onValueChange={(value) => setCategory(value)} value={category}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="토픽(주제) 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>카테고리(주제) 선택</SelectLabel>
                {TOPIC_CATEGORY.map((item) => {
                  return (
                    <SelectItem value={item.category} key={item.id}>
                      {item.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {/* <Asterisk className="w-3.5 h-3.5 text-[#f96859]" /> */}
            <Asterisk size={14} className="text-[#f96859]" />
            <Label className="text-muted-foreground">썸네일</Label>
          </div>
          {/* <Skeleton className="w-full aspect-video" /> */}
          <AppFileUpload file={thumbnail} onChange={setThumbnail} />
          <Button variant={'outline'} className="border-0" onClick={() => setThumbnail(null)}>
            <ImageOff />
            썸네일 제거
          </Button>
        </div>
      </section>
    </div>
  );
}
