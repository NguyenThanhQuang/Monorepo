import { api } from "@obtp/api-client";
import type { LoginPayload, LoginResponse } from "@obtp/shared-types";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      return await api.auth.login(payload);
    },
  });
};
