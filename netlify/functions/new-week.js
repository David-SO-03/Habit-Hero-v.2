import pkg from "pg";
import webPushPkg from "web-push";
const { Pool } = pkg;
const webPush = webPushPkg;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function handler() {
  try {
    const weekYear = new Date().toISOString().slice(0, 10); // simple YYYY-MM-DD, o puedes usar ISO week

    const check = await pool.query(
      "SELECT 1 FROM weekly_notifications WHERE week_year = $1",
      [weekYear]
    );
    if (check.rowCount > 0) return { statusCode: 200, body: "Already sent" };

    const subs = await pool.query("SELECT subscription FROM subscriptions");

    for (const row of subs.rows) {
      await webPush.sendNotification(
        row.subscription,
        JSON.stringify({
          title: "🔥 Nueva semana",
          body: "Empieza una nueva semana. ¡Vamos a por otra racha!",
          url: "/",
        })
      );
    }

    await pool.query(
      "INSERT INTO weekly_notifications (week_year, sent_at) VALUES ($1, NOW())",
      [weekYear]
    );

    return { statusCode: 200, body: "Weekly notifications sent" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Error sending weekly notifications" };
  }
}
