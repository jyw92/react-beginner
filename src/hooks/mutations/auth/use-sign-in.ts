import {signInWidthPassword} from '@/api/auth';
import type {UseMutationCallback} from '@/types';
import {useMutation} from '@tanstack/react-query';

export function useSignIn(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: signInWidthPassword,
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
    onSuccess: (data) => {
      if (callbacks?.onSuccess) callbacks.onSuccess(data);
    },
  });
}
