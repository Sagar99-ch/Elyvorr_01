/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as admin from "../admin.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as cart from "../cart.js";
import type * as contacts from "../contacts.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as payment from "../payment.js";
import type * as paymentMutations from "../paymentMutations.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  admin: typeof admin;
  adminDashboard: typeof adminDashboard;
  cart: typeof cart;
  contacts: typeof contacts;
  http: typeof http;
  orders: typeof orders;
  payment: typeof payment;
  paymentMutations: typeof paymentMutations;
  products: typeof products;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
