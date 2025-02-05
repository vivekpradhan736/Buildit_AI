import { api } from "@/convex/_generated/api";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const convexCtx = { db: api.users.ResetPerDayToken }; // Adjust Convex API path
        const users = await convexCtx.db.query("users").collect();

        for (const user of users) {
            await convexCtx.db.patch(user._id, {
                perDayToken: 150000,
                lastResetTokenDate: new Date().toISOString().split("T")[0]
            });
        }

        return res.status(200).json({ message: "Per Day Token Reset Successfully" });
    } catch (error) {
        console.error("Error resetting tokens:", error);
        return res.status(500).json({ error: "Failed to reset per day tokens" });
    }
}
