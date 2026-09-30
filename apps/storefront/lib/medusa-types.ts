export type Money = { amount: number; currency_code: string };

export type Address = {
  id?: string;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
  email?: string;
};

export type LineItem = {
  id: string;
  title?: string;
  product_title?: string;
  variant_title?: string;
  thumbnail?: string | null;
  quantity: number;
  unit_price?: number;
  variant?: {
    id?: string;
    product?: {
      handle?: string;
      thumbnail?: string | null;
      images?: { url: string }[];
    };
  };
};

export type Cart = {
  id: string;
  email?: string;
  currency_code?: string;
  region_id?: string;
  items?: LineItem[];
  subtotal?: number;
  total?: number;
  tax_total?: number;
  shipping_total?: number;
  shipping_address?: Address | null;
  billing_address?: Address | null;
  shipping_methods?: { id: string; name: string; amount: number }[];
};

export type ShippingOption = {
  id: string;
  name: string;
  amount?: number;
  price_type?: string;
  data?: Record<string, unknown>;
};

export type Customer = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  addresses?: Address[];
};

export type Order = {
  id: string;
  display_id?: number | string;
  status?: string;
  created_at: string;
  total?: number;
  subtotal?: number;
  currency_code?: string;
  items?: LineItem[];
  shipping_address?: Address | null;
  email?: string;
};

export type AuthResponse = string | { token: string };

export type CompleteResponse =
  | { type: "order"; order: Order }
  | { type: "cart"; cart: Cart }
  | { type: "error"; error: string };

export type StoreRegion = {
  id: string;
  name?: string;
  currency_code?: string;
  countries?: { iso_2: string }[];
};
