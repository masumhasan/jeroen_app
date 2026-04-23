import api from './api';

export const recipeService = {
  async getRecipe(id: string) {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },
  
  async getRecipes(params: any = {}) {
    const response = await api.get('/recipes', { params });
    return response.data;
  }
};
