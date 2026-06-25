import api, { baseURL } from './api';
import * as SecureStore from 'expo-secure-store';

interface MealPlanResponse {
  plan: any[];
  nextWeekPlan?: any[];
  targetCalories: number;
  weekStartDay?: string;
  mealPlanStartDate?: string;
  nextWeekStartDate?: string;
  shoppingList: any[];
}

export const authService = {
  async checkSignupAvailability(payload: { email: string; phoneNumber: string }) {
    const response = await api.post("/auth/signup/check-availability", payload);
    return response.data;
  },

  async sendOtp(email: string) {
    const response = await api.post("/auth/signup/send-otp", { email });
    return response.data;
  },

  async verifyOtp(email: string, otp: string) {
    const response = await api.post("/auth/signup/verify-otp", { email, otp });
    return response.data;
  },

  async sendForgotOtp(email: string) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async verifyForgotOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data.data;
  },

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const response = await api.post("/auth/reset-password", { email, resetToken, newPassword });
    return response.data;
  },

  async signup(userData: any) {
    const response = await api.post('/auth/signup', userData);
    if (response.data.data.token) {
      await SecureStore.setItemAsync('userToken', response.data.data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },

  async signin(credentials: any) {
    const response = await api.post('/auth/signin', credentials);
    if (response.data.data.token) {
      await SecureStore.setItemAsync('userToken', response.data.data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },

  async logout() {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async uploadAvatar(asset: { uri: string; mimeType?: string | null; fileName?: string | null }): Promise<string> {
    const mimeType = asset.mimeType || 'image/jpeg';
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const filename = `avatar-${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append('avatar', { uri: asset.uri, name: filename, type: mimeType } as any);

    // Use fetch() directly so React Native sets Content-Type with the correct
    // multipart boundary automatically — axios's header merging strips the boundary.
    const token = await SecureStore.getItemAsync('userToken');
    const fetchResponse = await fetch(`${baseURL}/auth/me/avatar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!fetchResponse.ok) {
      const err = await fetchResponse.json().catch(() => ({}));
      throw Object.assign(new Error(err?.message || 'Upload failed'), { response: { data: err } });
    }
    const json = await fetchResponse.json();
    const response = { data: json };

    const avatarPath: string = response.data.data.avatarPath;
    if (response.data.data?.user) {
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data.user));
    }
    return avatarPath;
  },

  async updateProfile(updateData: any) {
    const response = await api.patch('/auth/me', updateData);
    if (response.data.data.user) {
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data.user));
    }
    return response.data.data.user;
  },

  async updateWeight(weight: number) {
    const response = await api.patch('/auth/me/weight', { weight });
    if (response.data.data.user) {
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data.user));
    }
    return response.data.data.user;
  },

  async getMealPlan(): Promise<MealPlanResponse> {
    const response = await api.get("/auth/meal-plan");
    return response.data.data;
  },

  /** Lean payload for Progress tab (no full meal plan / recipe population). */
  async getProgress(): Promise<{
    user: any;
    mealsPlannedCount: number;
    targetCalories: number;
  }> {
    const response = await api.get("/auth/progress");
    return response.data.data;
  },

  async generateMealPlan(): Promise<MealPlanResponse> {
    const response = await api.post("/auth/meal-plan");
    return response.data.data;
  },

  async generateNextWeekMealPlan(): Promise<MealPlanResponse> {
    const response = await api.post("/auth/meal-plan", { nextWeek: true });
    return response.data.data;
  },

  async getSwapAlternatives(params: {
    day: string;
    mealType: string;
    recipeId: string;
    search?: string;
    sort?: "calories" | "protein" | "name";
    calorieFilter?: "all" | "<400" | "400-550" | ">550";
  }) {
    const response = await api.get("/auth/meal-plan/swap-alternatives", { params });
    return response.data.data as { currentMeal: any; alternatives: any[] };
  },

  async swapMeal(payload: {
    day: string;
    mealType: string;
    currentRecipeId: string;
    newRecipeId: string;
  }): Promise<{ plan: any[]; shoppingList: any[] }> {
    const response = await api.patch("/auth/meal-plan/swap", payload);
    return response.data.data;
  },
};
