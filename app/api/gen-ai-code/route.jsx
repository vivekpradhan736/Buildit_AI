import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt}=await req.json();
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request Timeout")), 60000)
    );
    
    try {
        const result = await Promise.race([
            GenAiCode.sendMessage(prompt),
            timeoutPromise
        ]);
        const resp = result.response.text();
        return NextResponse.json(JSON.parse(resp));
    } catch (e) {
        return NextResponse.json({ error: e.message || "Error occurred" });
    }
}