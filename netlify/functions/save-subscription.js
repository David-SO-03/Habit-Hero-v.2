import pkg from "pg";
const { Client } = pkg;

export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  let subscription;
  try {
    subscription = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // importante para Neon
  });

  try {
    await client.connect();
    await client.query(
      "INSERT INTO subscriptions (subscription) VALUES ($1)",
      [JSON.stringify(subscription)]
    );
    return { statusCode: 200, body: "Subscription saved" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error saving subscription" };
  } finally {
    awa
