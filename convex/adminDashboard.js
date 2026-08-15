import { query } from "./_generated/server";

export const getDashboardStats = query({
  args: {},

  handler: async (ctx) => {
    // =====================================================
    // PRODUCTS
    // =====================================================

    const products = await ctx.db.query("products").collect();

    const activeProducts = products.filter((product) => product.isActive);

    const lowStockProducts = activeProducts.filter(
      (product) => product.stock <= 5
    );

    // =====================================================
    // ORDERS
    // =====================================================

    const orders = await ctx.db.query("orders").collect();

    const totalOrders = orders.length;

    // =====================================================
    // PENDING ORDERS
    // =====================================================

    const pendingOrders = orders.filter(
      (order) => order.orderStatus === "pending"
    ).length;

    // =====================================================
    // REVENUE
    // =====================================================

    const revenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((total, order) => total + order.total, 0);

    // =====================================================
    // RECENT ORDERS
    // =====================================================

    const recentOrders = [...orders]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      }));

    // =====================================================
    // RETURN
    // =====================================================

    return {
      totalOrders,
      revenue,
      activeProducts: activeProducts.length,
      pendingOrders,
      lowStockCount: lowStockProducts.length,

      lowStockProducts: lowStockProducts.slice(0, 5).map((product) => ({
        id: product._id,
        name: product.name,
        stock: product.stock,
      })),

      recentOrders,
    };
  },
});
