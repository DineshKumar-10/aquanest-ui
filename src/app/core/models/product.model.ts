export interface Product {
  id: number;
  name: string;
  category: string;
  price: number | string;
  description: string;
  imageUrl: string | null;
  inStock: boolean;
}