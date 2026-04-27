import api from "./api";

export const communityService = {
  async getTopics(search = "") {
    const response = await api.get("/community/topics", {
      params: search ? { search } : {},
    });
    return response.data.data.topics as any[];
  },

  async toggleFollowTopic(topicId: string) {
    const response = await api.patch(`/community/topics/${topicId}/follow`);
    return response.data.data as { following: boolean; followerCount: number };
  },

  async getFeed(search = "") {
    const response = await api.get("/community/feed", {
      params: search ? { search } : {},
    });
    return response.data.data.posts as any[];
  },

  async createPost(payload: { topicIds: string[]; content: string; imageUri?: string | null }) {
    const formData = new FormData();
    formData.append("topicIds", JSON.stringify(payload.topicIds));
    formData.append("content", payload.content);
    if (payload.imageUri) {
      const filename = payload.imageUri.split("/").pop() || `post-${Date.now()}.jpg`;
      const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
      formData.append("post_image", {
        uri: payload.imageUri,
        name: filename,
        type: `image/${ext}`,
      } as any);
    }
    const response = await api.post("/community/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.post;
  },

  async getPostDetails(postId: string) {
    const response = await api.get(`/community/posts/${postId}`);
    return response.data.data as { post: any; comments: any[] };
  },

  async updatePost(postId: string, content: string) {
    const response = await api.patch(`/community/posts/${postId}`, { content });
    return response.data.data.post as any;
  },

  async deletePost(postId: string) {
    const response = await api.delete(`/community/posts/${postId}`);
    return response.data as { status: string; message: string };
  },

  async toggleLike(postId: string) {
    const response = await api.patch(`/community/posts/${postId}/like`);
    return response.data.data as { likedByMe: boolean; likeCount: number };
  },

  async addComment(postId: string, content: string) {
    const response = await api.post(`/community/posts/${postId}/comments`, { content });
    return response.data.data as { comment: any; commentCount: number };
  },
};
