'use client'
import axios from "axios";
import { useState } from "react";

let gumStream : any = null;
let recorder : any= null;
let audioContext: any = null;

function SpeechRecorder() {

    const [originalText, setoriginalText] = useState();
    const [translatedText, settranslatedText] = useState<string>("")
    const [translateToLanguage, settranslateToLanguage] =useState<string>("")
    const [isLoadingRequest, setisLoadingRequest] = useState<boolean>(false)
    const [isListening, setisListening] = useState<boolean>(false)

    function startRecording() {
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
                setisListening(true)
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
        setisListening(false)
        sendRequestToTranslate(blob)
    }

    // send API request to translate
    async function sendRequestToTranslate(blob : Blob){
        setisLoadingRequest(true)
        let data = new FormData();

        data.append('translateTo', translateToLanguage);
        data.append('audio', blob, "recording.wav");

        //Download the wav file
        //downloadBlobAsWave(blob, "recording.wav")

        const config = {
            headers: {'content-type': 'multipart/form-data'}
        }
        let response = await axios.post('/api/translate', data, config);

        setoriginalText(response.data.originalText)
        settranslatedText(response.data.translatedText)
        setisLoadingRequest(false)
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

                {/* Target language */}
                <div className="mb-3">
                    <p className="mt-3">Enter traget language</p>
                    <input
                        className="border py-2 px-3"
                        value={translateToLanguage}
                        onChange={(event : any) => {
                            settranslateToLanguage(event.target.value);
                    }}
                    />
                </div>

                <div className="mb-3">
                    <b className="text-gray-500">Orginal version</b>
                    <p>{originalText}</p>
                </div>
                <div>
                    <b className="text-gray-500">Translated version</b>
                    <p>{translatedText}</p>
                </div>
            </div>
            <button onClick={() => startRecording()} type="button" className="border py-2 px-3">Start</button>
            <button onClick={stopRecording} type="button"  className="border py-2 px-3">Stop</button>

            {/* Show status message */}
            {
                isLoadingRequest ?  <p className="text-green-500 mt-4">Translating ...</p> :
                isListening ? <p className="text-red-500 mt-4">Listening ...</p> :
                null
            }
        </div>
    );
}

export default SpeechRecorder;