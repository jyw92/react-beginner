export type UseMutationCallback = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export enum TOPIC_STATUS {
  TEMP = 'temp',
  PUBLISH = 'publish',
}

export interface Topic {
  id: number;
  created_at: Date | string;
  author: string; //추후 변경
  title: string;
  content: string;
  category: string;
  thumbnail: string;
  status: TOPIC_STATUS;
  email: string;
}
