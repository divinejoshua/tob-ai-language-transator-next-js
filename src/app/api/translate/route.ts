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
        const file: File | null = request.get('audio') as unknown as File
        let translateTo = request.get('translateTo')

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

        // Convert the audio to text
        let textFromAudio : any = await audioToText(filePath)

        //Translate the text
        let translatedText = await translateText(textFromAudio, translateTo)

        //Data response
        let data = {
            originalText : textFromAudio,
            translatedText : translatedText
        }

        //Response
        return NextResponse.json(data, {
            status: 200,
        });
    }

    // Convert from audio to text
    async function audioToText(filePath : string) {

        // GPT
        const transcription : any = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
            response_format: "text",
        });

        return transcription.replace(/\n/g, "")
    }

    // Translate text
    async function translateText(text : any, translateTo:any) {
        const completion = await openai.chat.completions.create({
            messages: [{"role": "system", "content": "You are a helpful translator AI software built with DidiAi and Created by DivineEr"},
                    {"role": "user", "content": `convert this text to ${translateTo}, The text is \n ${text}`}],
            model: "gpt-4-turbo",
        });
        return completion.choices[0].message.content;
    }