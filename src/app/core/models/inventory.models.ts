/** Contratos tomados de BodegaFlow API (http://localhost:5070/swagger). */

export interface Product {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description: string | null;
  readonly unitPrice: number;
  readonly minimumStock: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface ProductRequest {
  sku: string;
  name: string;
  description: string | null;
  unitPrice: number;
  minimumStock: number;
}

export interface StockItem {
  readonly productId: string;
  readonly sku: string;
  readonly name: string;
  readonly quantity: number;
  readonly minimumStock: number;
  readonly unitPrice: number;
  readonly stockValue: number;
}

export interface Dashboard {
  readonly productCount: number;
  readonly totalUnits: number;
  readonly inventoryValue: number;
  readonly lowStockCount: number;
  readonly lowStockProducts: readonly StockItem[];
}

/** El API serializa el enumerado como texto: "Entry" | "Exit". */
export type MovementType = 'Entry' | 'Exit';

export interface Movement {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly sku: string;
  readonly type: MovementType;
  readonly quantity: number;
  readonly note: string | null;
  readonly createdAt: string;
}

export interface MovementRequest {
  productId: string;
  type: MovementType;
  quantity: number;
  note: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly user: AuthUser;
}

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  Entry: 'Entrada',
  Exit: 'Salida',
};
