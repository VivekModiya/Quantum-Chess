const sounds: Record<string, HTMLAudioElement> = {
  move: new Audio('/audio/move.mp3'),
}

Object.values(sounds).forEach(audio => {
  audio.volume = 1
})

export function playSound(type: keyof typeof sounds) {
  sounds[type]?.play().catch(() => {})
}
