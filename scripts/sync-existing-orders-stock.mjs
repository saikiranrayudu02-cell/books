import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function syncStock() {
  console.log('🔄 Fetching all ordered items to deduct from stock...');
  try {
    // We want to reset the stock to default/original (e.g. 100) first, or we can just deduct the quantity.
    // Wait, let's look at the current database values:
    const productsBefore = await sql`SELECT id, name, stock FROM products`;
    console.log('Current products in database:', productsBefore);

    // Let's get total quantity ordered per product
    const orderedItems = await sql`
      SELECT product_id, SUM(quantity)::int as total_ordered
      FROM order_items
      GROUP BY product_id
    `;
    console.log('Total ordered quantities:', orderedItems);

    // If products have stock = 100, let's deduct the total_ordered.
    // To make sure it's accurate: let's set product stock to 100 (default) first and then subtract the ordered count, 
    // or just subtract the ordered count from the current stock if they are currently at 100.
    // In the user's DB, we see:
    // - pp2 has stock 0, units sold 0 (since it was just created manually or via tests, wait, in the screenshot pp2 has In Stock (100) and 0 sold).
    // - p2 has stock 100, units sold 1.
    // - p1 has stock 100, units sold 1.
    // Let's loop through all products and update their stock. If a product has a total_ordered > 0, 
    // we can update: stock = stock - total_ordered (if stock hasn't been decremented yet).
    // Let's check:
    for (const item of orderedItems) {
      const { product_id, total_ordered } = item;
      console.log(`Deducting ${total_ordered} from stock for product ${product_id}...`);
      await sql`
        UPDATE products
        SET stock = GREATEST(0, stock - ${total_ordered})
        WHERE id = ${product_id}
      `;
    }

    const productsAfter = await sql`SELECT id, name, stock FROM products`;
    console.log('✅ Stock sync completed successfully!');
    console.log('Updated products in database:', productsAfter);
  } catch (error) {
    console.error('❌ Error syncing stock:', error);
  }
}

syncStock();
