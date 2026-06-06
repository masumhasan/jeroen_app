import * as SecureStore from 'expo-secure-store';
import api from './api';

export const bookService = {
  /**
   * Reads the cached purchasedBooks SKUs from SecureStore.
   * Returns an empty array if not yet claimed or no data.
   */
  async getPurchasedSkus(): Promise<string[]> {
    try {
      const raw = await SecureStore.getItemAsync('userData');
      if (raw) {
        const user = JSON.parse(raw);
        return Array.isArray(user.purchasedBooks) ? user.purchasedBooks : [];
      }
    } catch {
      // ignore parse errors
    }
    return [];
  },

  /**
   * Calls the backend which queries Shopify by the signed-in user's email.
   * Saves the returned SKUs to the backend DB and updates the local SecureStore cache.
   */
  async claimBooks(): Promise<string[]> {
    const response = await api.post('/auth/me/claim-books');
    const skus: string[] = response.data.data.purchasedBooks;

    // Keep SecureStore cache in sync
    const raw = await SecureStore.getItemAsync('userData');
    if (raw) {
      const user = JSON.parse(raw);
      await SecureStore.setItemAsync(
        'userData',
        JSON.stringify({ ...user, purchasedBooks: skus })
      );
    }

    return skus;
  },
};
