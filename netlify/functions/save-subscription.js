import pkg from "pg";
const { Client } = pkg;

export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let subscription;
  try {
    subscription = JSON.parse(event.body);
  } catch (err) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("INSERT INTO subscriptions (subscription) VALUES ($1)", [
      JSON.stringify(subscription),
    ]);
    return new Response("Subscription saved", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error saving subscription", { status: 500 });
  } finally {
    await client.end();
  }
}
