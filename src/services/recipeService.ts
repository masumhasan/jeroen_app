import api from './api';

export const recipeService = {
  async getRecipe(id: string) {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },
  
  async getRecipes(params: any = {}) {
    const response = await api.get('/recipes', { params });
    return response.data;
  },

  async toggleFavourite(recipeId: string) {
    const response = await api.patch(`/recipes/${recipeId}/favourite`);
    return response.data;
  },

  async getFavourites() {
    const response = await api.get('/recipes/user/favourites');
    return response.data.recipes;
  },

  async submitUserRecipe(formData: FormData) {
    const response = await api.post('/user-recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getMyUserRecipes() {
    const response = await api.get('/user-recipes/my');
    return response.data.recipes;
  },

  async getUserRecipe(id: string) {
    const response = await api.get(`/user-recipes/${id}`);
    return response.data;
  },

  async updateUserRecipe(id: string, formData: FormData) {
    const response = await api.put(`/user-recipes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteUserRecipe(id: string) {
    const response = await api.delete(`/user-recipes/${id}`);
    return response.data;
  },
};
