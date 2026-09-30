"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { medusa } from "./medusa";
import { regionId } from "./data";
import type { Cart, ShippingOption, CompleteResponse, Address } from "./medusa-types";

const COOKIE = "byshree_cart";
const CART_FIELDS =
  "*items,*items.variant,*items.variant.product,*shipping_address,*billing_address,*shipping_methods,total,subtotal,tax_total,shipping_total,currency_code";

type RetrieveQuery = { fields?: string };

export async function getCartId(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value ?? null;
}

async function setCartId(id: string) {
  const c = await cookies();
  c.set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getOrCreateCart(): Promise<Cart> {
  const id = await getCartId();
  if (id) {
    try {
      const { cart } = (await medusa.store.cart.retrieve(id, { fields: CART_FIELDS } as RetrieveQuery)) as {
        cart: Cart;
      };
      if (cart) return cart;
    } catch {
      // fall through and create
    }
  }
  const region_id = await regionId();
  const { cart } = (await medusa.store.cart.create({ region_id })) as { cart: Cart };
  await setCartId(cart.id);
  return cart;
}

export async function getCart(): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  try {
    const { cart } = (await medusa.store.cart.retrieve(id, { fields: CART_FIELDS } as RetrieveQuery)) as {
      cart: Cart;
    };
    return cart;
  } catch {
    return null;
  }
}

export async function addLineItem(variantId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  await medusa.store.cart.createLineItem(cart.id, { variant_id: variantId, quantity });
  revalidatePath("/", "layout");
}

export async function updateLineItem(itemId: string, quantity: number) {
  const id = await getCartId();
  if (!id) return;
  if (quantity <= 0) {
    await medusa.store.cart.deleteLineItem(id, itemId);
  } else {
    await medusa.store.cart.updateLineItem(id, itemId, { quantity });
  }
  revalidatePath("/", "layout");
}

export async function removeLineItem(itemId: string) {
  const id = await getCartId();
  if (!id) return;
  await medusa.store.cart.deleteLineItem(id, itemId);
  revalidatePath("/", "layout");
}

export async function applyPromoCode(code: string) {
  const id = await getCartId();
  if (!id) return { ok: false, error: "no cart" };
  try {
    await medusa.store.cart.update(id, { promo_codes: [code] });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setAddresses(addr: Required<Pick<Address, "email" | "first_name" | "last_name" | "address_1" | "city" | "postal_code" | "country_code">> & Address) {
  const cart = await getOrCreateCart();
  await medusa.store.cart.update(cart.id, {
    email: addr.email,
    shipping_address: addr,
    billing_address: addr,
  });
  revalidatePath("/checkout", "layout");
}

export async function setShippingMethod(option_id: string) {
  const id = await getCartId();
  if (!id) return;
  await medusa.store.cart.addShippingMethod(id, { option_id });
  revalidatePath("/checkout", "layout");
}

export async function listShippingOptions(): Promise<ShippingOption[]> {
  const id = await getCartId();
  if (!id) return [];
  try {
    const { shipping_options } = (await medusa.store.fulfillment.listCartOptions({ cart_id: id })) as {
      shipping_options: ShippingOption[];
    };
    return shipping_options;
  } catch {
    return [];
  }
}

export async function completeOrder(): Promise<CompleteResponse> {
  const id = await getCartId();
  if (!id) return { type: "error", error: "no cart" };
  try {
    const res = (await medusa.store.cart.complete(id)) as CompleteResponse;
    if (res.type === "order") {
      const c = await cookies();
      c.delete(COOKIE);
      revalidatePath("/", "layout");
    }
    return res;
  } catch (e) {
    return { type: "error", error: (e as Error).message };
  }
}
