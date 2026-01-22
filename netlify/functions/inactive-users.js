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
    const res = await pool.query(
      `SELECT id, subscription, last_notified_inactive
       FROM subscriptions
       WHERE last_notified_inactive IS NULL
          OR last_notified_inactive < NOW() - INTERVAL '4 days'`
    );

    for (const row of res.rows) {
      await webPush.sendNotification(
        row.subscription,
        JSON.stringify({
          title: "👀 Te echamos de menos",
          body: "Llevas 4 días sin abrir Habit Hero",
          url: "/",
        })
      );

      await pool.query(
        "UPDATE subscriptions SET last_notified_inactive = NOW() WHERE id = $1",
        [row.id]
      );
    }

    return { statusCode: 200, body: "Inactive notifications sent" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Error sending notifications" };
  }
}
