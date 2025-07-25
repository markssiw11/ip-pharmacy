import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apiCredentials = pgTable("api_credentials", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  lastTested: timestamp("last_tested"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  orderDate: timestamp("order_date").notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull(), // completed, processing, shipped, cancelled
  branch: text("branch").notNull(),
  syncedAt: timestamp("synced_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull().unique(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  syncedAt: timestamp("synced_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull(),
  branch: text("branch").notNull(),
  stockLevel: integer("stock_level").notNull(),
  syncedAt: timestamp("synced_at").defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // orders, inventory
  status: text("status").notNull(), // success, error
  recordsCount: integer("records_count"),
  errorMessage: text("error_message"),
  syncedAt: timestamp("synced_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  orderDate: timestamp("order_date").defaultNow(),
  deliveryDate: timestamp("delivery_date").notNull(),
  status: text("status").default("Đã tạo"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(
    () => purchaseOrders.id
  ),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
});

export const insertApiCredentialsSchema = createInsertSchema(
  apiCredentials
).pick({
  clientId: true,
  clientSecret: true,
  isEnabled: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  syncedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  syncedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  syncedAt: true,
});

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  syncedAt: true,
});

export type ApiCredentials = typeof apiCredentials.$inferSelect;
export type InsertApiCredentials = z.infer<typeof insertApiCredentialsSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
