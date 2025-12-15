import {signUpAgreed} from '@/api/auth';
import type {UseMutationCallback} from '@/types';
import {useMutation} from '@tanstack/react-query';

export function useSignUpAgreed(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: signUpAgreed,
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
