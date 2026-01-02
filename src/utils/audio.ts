import { AccentType } from "@/types";

// --- CẤU HÌNH VOLUME ---
const VOL_GOOGLE_TTS = 0.5; // Google thường "hét" rất to -> Giảm mạnh
const VOL_OTHER_SOURCE = 1.0; // DictionaryAPI, Oxford... thường chuẩn -> Để Max
const VOL_NATIVE_BROWSER = 1.0; // Giọng trình duyệt -> Để Max

export const getGoogleAudioLink = (text: string, type: AccentType) => {
  if (!text || !text.trim()) return "";
  const lang = type === AccentType.UK ? "en-GB" : "en-US";
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(
    text.trim()
  )}`;
};

export const playAudio = async (
  url?: string,
  textToSpeak?: string,
  accent: AccentType = AccentType.US
) => {
  // 1. Ưu tiên chạy file MP3 từ URL
  if (url && url.trim()) {
    try {
      const audio = new Audio(url);

      const isGoogle =
        url.includes("google.com") || url.includes("gstatic.com");

      if (isGoogle) {
        audio.volume = VOL_GOOGLE_TTS;
      } else {
        audio.volume = VOL_OTHER_SOURCE;
      }

      await audio.play();
      return;
    } catch (error) {
      console.warn("Audio URL failed, falling back to native TTS...", error);
    }
  }

  if (textToSpeak) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.lang = accent === AccentType.UK ? "en-GB" : "en-US";
    utterance.rate = 0.9;

    utterance.volume = VOL_NATIVE_BROWSER;

    window.speechSynthesis.speak(utterance);
  }
};
