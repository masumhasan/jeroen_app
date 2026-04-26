import api from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
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

  async getMealPlan(): Promise<{ plan: any[]; targetCalories: number; shoppingList: any[] }> {
    const response = await api.get("/auth/meal-plan");
    return response.data.data;
  },

  async generateMealPlan(): Promise<{ plan: any[]; targetCalories: number; shoppingList: any[] }> {
    const response = await api.post("/auth/meal-plan");
    return response.data.data;
  },
};
