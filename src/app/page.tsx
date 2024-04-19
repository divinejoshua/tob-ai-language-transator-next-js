import Image from "next/image";
import SpeechRecorder from "./components/speechRecorder";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      https://github.com/divinejoshua/tob-ai-language-transator-next-js

      <SpeechRecorder/>
    </main>
  );
}
