export const CHARACTERS = [
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁',
  '🐸', '🐵', '🐔', '🐧', '🦄', '🐙', '🐢', '🦖',
]

export function assignCharacters(names) {
  return names.map((name, i) => ({ name, emoji: CHARACTERS[i % CHARACTERS.length] }))
}
