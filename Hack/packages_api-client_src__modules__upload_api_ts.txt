import { http } from "../core/http-client";

export const uploadApi = {
  uploadCompanyLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    return http.post<{ url: string }>("/uploads/company-logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
