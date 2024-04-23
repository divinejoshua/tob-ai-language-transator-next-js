'use client'
import axios from "axios";
import { useState } from "react";

let gumStream : any = null;
let recorder : any= null;
let audioContext: any = null;

function SpeechRecorder() {

    const [originalText, setoriginalText] = useState();
    const [translatedText, settranslatedText] = useState()

    const startRecording = () => {
        let constraints = {
            audio: true,
            video: false
        }

        audioContext = new window.AudioContext();
        console.log("sample rate: " + audioContext.sampleRate);

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function (stream) {
                console.log("initializing Recorder.js ...");

                gumStream = stream;

                let input = audioContext.createMediaStreamSource(stream);

                // @ts-ignore
                recorder = new window.Recorder(input, {
                    numChannels: 1
                })

                recorder.record();
                console.log("Recording started");
            }).catch(function (err) {
                //enable the record button if getUserMedia() fails
        });

    }

    const stopRecording = () => {
        console.log("stopButton clicked");

        recorder.stop(); //stop microphone access
        gumStream.getAudioTracks()[0].stop();

        recorder.exportWAV(onStop);
    }

    const onStop = (blob : Blob) => {
        console.log("uploading...");
        sendRequestToTranslate(blob)
    }

    // send API request to translate
    async function sendRequestToTranslate(blob : Blob){
        let data = new FormData();

        data.append('translateTo', "French");
        data.append('audio', blob, "recording.wav");

        //Download the wav file
        //downloadBlobAsWave(blob, "recording.wav")

        const config = {
            headers: {'content-type': 'multipart/form-data'}
        }
        let response = await axios.post('/api/translate', data, config);

        setoriginalText(response.data.originalText)
        settranslatedText(response.data.translatedText)
    }

    //Function to Download orginal audio
    function downloadBlobAsWave(blob : Blob, fileName : string) {
        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create an <a> element
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;

        // Append the <a> element to the document body
        document.body.appendChild(a);

        // Programmatically trigger a click event on the <a> element
        a.click();

        // Cleanup: Remove the <a> element and revoke the URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

    return (
        <div>
            <div className="mb-3">
                <div className="mb-3">
                    <b className="text-gray-500">Orginal version</b>
                    <p>{originalText}</p>
                </div>
                <div>
                    <b className="text-gray-500">Translated version</b>
                    <p>{translatedText}</p>
                </div>
            </div>
            <button onClick={startRecording} type="button" className="border py-2 px-3">Start</button>
            <button onClick={stopRecording} type="button"  className="border py-2 px-3">Stop</button>
        </div>
    );
}

export default SpeechRecorder;