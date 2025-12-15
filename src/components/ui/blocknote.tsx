import '@blocknote/core/fonts/inter.css';
import {useCreateBlockNote} from '@blocknote/react';
import {BlockNoteView} from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import {ko} from '@blocknote/core/locales';
import type {Block} from '@blocknote/core';
import {useEffect} from 'react';
interface Props {
  props?: Block[];
  setContent?: (content: Block[]) => void;
  readonly?: boolean;
}

function BlockNote({props, setContent, readonly}: Props) {
  const locale = ko;
  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/' 를 눌러 명령어를 살행하세요.",
      },
    },
  });

  useEffect(() => {
    if (props && props.length > 0) {
      const current = JSON.stringify(editor.document);
      const next = JSON.stringify(props);

      // current 값과 next 값이 같으면 교체를 안함 => 무한루프 방지
      if (current !== next) {
        editor.replaceBlocks(editor.document, props);
      }
    }
  }, [props, editor]);

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => {
        if (!readonly) {
          setContent?.(editor.document);
        }
      }}
      editable={!readonly}
      shadCNComponents={
        {
          // Pass modified ShadCN components from your project here.
          // Otherwise, the default ShadCN components will be used.
        }
      }
    />
  );
}

export {BlockNote};
