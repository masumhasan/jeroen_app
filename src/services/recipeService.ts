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
};
