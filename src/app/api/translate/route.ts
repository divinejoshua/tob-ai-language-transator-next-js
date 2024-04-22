import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});


    // POST request
    export async function POST (req: NextRequest, res : NextResponse) {

        let textFromAudio : any = await audioToText()

        //Data response
        let data = textFromAudio

        //Response
        return NextResponse.json(data, {
            status: 200,
        });
    }


    // Convert from audio to text
    async function audioToText() {

        const path = require('path');

        // Get the absolute path to the file
        const audioFilePath = path.join(__dirname, 'test.wav');

        console.log(audioFilePath)
        fs.access(audioFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error("File 'test.wav' does not exist.");
            } else {
                console.log("File 'test.wav' exists.");
            }
        });

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: "whisper-1",
            response_format: "text",
        });

        console.log(transcription);
        return transcription
    }
