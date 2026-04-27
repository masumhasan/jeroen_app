import api from "./api";

export type AppContentType =
  | "about-us"
  | "privacy-policy"
  | "terms-and-conditions";

export interface AppContent {
  _id: string;
  type: AppContentType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AppContentResponse {
  success?: boolean;
  message?: string;
  data?: AppContent;
}

export const contentService = {
  async getByType(type: AppContentType): Promise<AppContent> {
    const response = await api.get<AppContentResponse>(`/app-content/${type}`);
    if (!response.data?.data) {
      throw new Error("Content not found");
    }
    return response.data.data;
  },
};

