import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../keys/google.json"),
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

const calendar = google.calendar({ version: "v3", auth });

export async function getEvents() {
    const res = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 5,
    });

    return res.data.items || [];
}