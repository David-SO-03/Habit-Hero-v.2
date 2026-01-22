import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  const subscription = JSON.parse(event.body);

  try {
    await pool.query("INSERT INTO subscriptions (subscription) VALUES ($1)", [
      subscription,
    ]);
    return { statusCode: 200, body: "Subscription saved" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Error saving subscription" };
  }
}
