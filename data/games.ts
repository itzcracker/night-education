export type Game = { slug: string; title: string; category: string; cover: string; path: string }

export const games: Game[] = [
  { slug: 'neon-drift', title: 'Neon Drift', category: 'Arcade', cover: '/covers/neon-drift.png', path: '/games/neon-drift/index.html' },
  { slug: 'moonbound', title: 'Moonbound', category: 'Adventure', cover: '/covers/moonbound.png', path: '/games/moonbound/index.html' },
  { slug: 'void-puzzle', title: 'Void Puzzle', category: 'Puzzle', cover: '/covers/void-puzzle.png', path: '/games/void-puzzle/index.html' },
  { slug: 'bat-night', title: 'Bat Night', category: 'Arcade', cover: '/covers/bat-night.png', path: '/games/bat-night/index.html' },
  { slug: 'starfall', title: 'Starfall', category: 'Arcade', cover: '/covers/starfall.png', path: '/games/starfall/index.html' },
  { slug: 'hex-garden', title: 'Hex Garden', category: 'Strategy', cover: '/covers/hex-garden.png', path: '/games/hex-garden/index.html' },
]
