import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Total Revenue (Sum of 'total' in orders table where payment_status = 'paid')
    const revenueResult = await sql`SELECT SUM(total) as total_revenue FROM orders WHERE payment_status = 'paid'`;
    const totalRevenue = revenueResult[0].total_revenue || 0;

    // 2. Total Orders
    const ordersResult = await sql`SELECT COUNT(id) as total_orders FROM orders`;
    const totalOrders = parseInt(ordersResult[0].total_orders || '0');

    // 3. Total Users
    const usersResult = await sql`SELECT COUNT(id) as total_users FROM users WHERE role = 'customer'`;
    const totalUsers = parseInt(usersResult[0].total_users || '0');

    // 4. Low Stock Products
    const stockResult = await sql`SELECT COUNT(id) as low_stock FROM products WHERE stock < 10`;
    const lowStockProducts = parseInt(stockResult[0].low_stock || '0');

    // 5. Total Products
    const productsCountResult = await sql`SELECT COUNT(id) as total_products FROM products`;
    const totalProducts = parseInt(productsCountResult[0].total_products || '0');

    // 6. Recent Orders
    const recentOrders = await sql`
      SELECT o.id, o.order_number as "orderNumber", o.total, o.status, o.created_at as "createdAt", u.name as "userName"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    // 7. Top Selling Products
    const topProducts = await sql`
      SELECT oi.product_name as "name", SUM(oi.quantity) as "sold", SUM(oi.price * oi.quantity) as "revenue"
      FROM order_items oi
      GROUP BY oi.product_name
      ORDER BY sold DESC
      LIMIT 4
    `;

    // 8. Recent Activity (Mix of recent signups and orders)
    const recentSignups = await sql`
      SELECT name, email, created_at as "createdAt"
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
      LIMIT 3
    `;

    const recentSales = await sql`
      SELECT o.order_number as "orderNumber", o.total, o.created_at as "createdAt", u.name as "userName"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 3
    `;

    const recentActivity: any[] = [];
    
    recentSales.forEach(s => {
      recentActivity.push({
        type: 'sale',
        title: 'New sale recorded',
        desc: `Order #${s.orderNumber} placed by ${s.userName || 'Guest'}`,
        time: s.createdAt,
        color: 'green'
      });
    });

    recentSignups.forEach(u => {
      recentActivity.push({
        type: 'user',
        title: 'New user registered',
        desc: `${u.name} (${u.email}) joined`,
        time: u.createdAt,
        color: 'blue'
      });
    });

    // Sort combined activity by date descending
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers,
        lowStockProducts,
        totalProducts,
        recentOrders,
        topProducts,
        recentActivity: recentActivity.slice(0, 5)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
