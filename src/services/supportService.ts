import api from "./api";

export type SupportApiMessage = {
  id: string;
  body?: string;
  imageUrl?: string | null;
  from: string;
  text: string;
  time: string;
  isAdmin: boolean;
  createdAt?: string;
};

export const supportService = {
  async getThread(): Promise<{
    threadId: string;
    userUnreadCount: number;
    messages: SupportApiMessage[];
  }> {
    const res = await api.get("/support/thread");
    return res.data.data;
  },

  async markThreadRead(): Promise<void> {
    await api.patch("/support/thread/read");
  },

  async sendText(body: string): Promise<SupportApiMessage> {
    const res = await api.post("/support/messages", { body });
    return res.data.data.message;
  },

  async sendWithImage(params: {
    body: string;
    uri: string;
    mimeType: string;
    filename: string;
  }): Promise<SupportApiMessage> {
    const form = new FormData();
    if (params.body.trim()) form.append("body", params.body.trim());
    form.append("support_image", {
      uri: params.uri,
      type: params.mimeType,
      name: params.filename,
    } as unknown as Blob);
    const res = await api.post("/support/messages", form);
    return res.data.data.message;
  },
};
