export interface Product {
  id?: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  supplier?: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel?: number;
  expiryDate?: Date;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  supplier?: string;
  brand?: string;
  lowStock?: boolean;
}
