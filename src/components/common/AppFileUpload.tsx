import React, {useRef, useEffect, useMemo} from 'react'; // useMemo 추가
import {Button, Input} from '../ui';
import {Image} from 'lucide-react';

interface Props {
  file: File | string | null;
  onChange: (file: File | string | null) => void;
}

function AppFileUpload({file, onChange}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ 1. useState 대신 useMemo 사용
  // 설명: 렌더링 도중에 값을 바로 계산하므로 'setState'가 필요 없음 (에러 해결)
  const previewUrl = useMemo(() => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file); // File 객체일 때 바로 URL 생성
  }, [file]);

  // ✅ 2. 메모리 누수 방지 (Cleanup)
  // 설명: previewUrl이 바뀌거나 컴포넌트가 사라질 때, 이전 URL(blob:)을 메모리에서 해제
  useEffect(() => {
    return () => {
      // 생성된 Blob URL인 경우에만 해제 (문자열 URL은 해제하면 안 됨)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    onChange(selectedFile);
    event.target.value = ''; // 동일 파일 재선택 허용
  };

  const handleRenderPreview = () => {
    if (previewUrl) {
      return <img src={previewUrl} alt="@THUMBNAIL" className="w-full aspect-video rounded-lg object-cover border" />;
    }

    return (
      <div className="w-full flex items-center justify-center aspect-video bg-card rounded-lg">
        <Button type="button" size={'icon'} variant={'ghost'} onClick={() => fileInputRef.current?.click()}>
          <Image />
        </Button>
      </div>
    );
  };

  return (
    <>
      {handleRenderPreview()}
      <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleChangeFile} />
    </>
  );
}

export {AppFileUpload};
