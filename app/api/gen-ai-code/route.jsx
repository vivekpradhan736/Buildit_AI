import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { prompt } = await req.json();

    try { 
        const result = await GenAiCode.sendMessage(prompt);
        
        // Log result to see if it contains data
        console.log("API Result:", result);

        // Ensure `result.response` exists before calling `text()`
        if (!result || !result.response) {
            throw new Error("Invalid API response");
        }

        const resp = await result.response.text();
        console.log("Raw Response Text:", resp);  // Log raw text

        return NextResponse.json(JSON.parse(resp));

    } catch (e) {
        console.error("Error in API Call:", e);  // Log full error
        return NextResponse.json({ error: e.message || "Unknown error" });
    }
}
