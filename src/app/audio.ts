// تشغيل التسجيلات الحقيقية واحد ورا الثاني، مع إيقافها عند تبديل الملف أو الخروج.
let current: HTMLAudioElement | null = null;
let queue: string[] = [];

function playNext() {
  const next = queue.shift();
  if (!next) { current = null; return; }
  current = new Audio(next);
  current.onended = playNext;
  void current.play()?.catch?.(() => {});
}

export function playClips(urls: string[]) {
  stopAudio();
  queue = [...urls];
  playNext();
}

export function stopAudio() {
  queue = [];
  current?.pause();
  current = null;
}
