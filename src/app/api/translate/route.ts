import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import { writeFile } from "fs/promises";

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});


    // POST request
    export async function POST (req: NextRequest, res : NextResponse) {

        //Get the request body
        let request = await req.formData()
        const file: File | null = request.get('file') as unknown as File

        // Check if file exist
        if (!file) {
          return NextResponse.json({ success: false }, { status : 400})
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // With the file data in the buffer, you can do whatever you want with it.
        // For this, we'll just write it to the filesystem in a new location
        const filePath = `/tmp/${file.name}`
        await writeFile(filePath, buffer)

        let textFromAudio = await audioToText(filePath)

        //Data response
        let data = textFromAudio

        //Response
        return NextResponse.json(data, {
            status: 200,
        });
    }


    // Convert from audio to text
    async function audioToText(filePath : string) {

        // GPT
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
            response_format: "text",
        });

        return transcription
    }
