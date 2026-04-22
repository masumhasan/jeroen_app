import { useEffect, useState } from "react";

type Category = {
  title: string;
  items: string[];
};

type ShoppingItem = {
  name: string;
  selected: boolean;
  category: string;
};

export const useShoppingList = (initialCategories: Category[]) => {
  // Flatten all items with their categories and selected state
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const allItems: ShoppingItem[] = [];
    initialCategories.forEach((category) => {
      category.items.forEach((item) => {
        allItems.push({
          name: item,
          selected: false,
          category: category.title,
        });
      });
    });
    return allItems;
  });

  const [totalItems, setTotalItems] = useState(items.length);
  const [selectedCount, setSelectedCount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Update counts whenever items change
  useEffect(() => {
    const selected = items.filter((item) => item.selected).length;
    setSelectedCount(selected);
    setTotalItems(items.length);
    setProgressPercentage(Math.round((selected / items.length) * 100));
  }, [items]);

  const toggleItem = (itemName: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.name === itemName ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const getItemsByCategory = (categoryTitle: string) => {
    return items
      .filter((item) => item.category === categoryTitle)
      .map((item) => ({
        name: item.name,
        selected: item.selected,
      }));
  };

  const resetSelection = () => {
    setItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: false })),
    );
  };

  return {
    items,
    totalItems,
    selectedCount,
    progressPercentage,
    toggleItem,
    getItemsByCategory,
    resetSelection,
  };
};
