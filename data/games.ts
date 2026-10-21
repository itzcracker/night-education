export type Game = { slug: string; title: string; category: string; cover: string; path: string }

const game = (slug: string, title: string, cover: string): Game => ({ slug, title, category: 'Featured', cover, path: `/games/${slug}.html` })

export const games: Game[] = [
  game('1v1-lol', '1v1.LOL', '/game-covers/1v1lol.png'),
  game('among-us', 'Among Us', '/game-covers/amongus.png'),
  game('angry-birdsspace', 'Angry Birds Space', '/game-covers/angrybs.png'),
  game('baldis-basics', "Baldi's Basics", '/game-covers/baldis.png'),
  game('basket-random', 'Basket Random', '/game-covers/basketrandom.png'),
  game('bloons-td5', 'Bloons TD 5', '/game-covers/bloonstd5.png'),
  game('cactus-mccoy', 'Cactus McCoy', '/game-covers/cactus.png'),
  game('kirby-soft-and-wet', 'Kirby: Soft and Wet', '/game-covers/kirby.png'),
  game('mario-kart-64', 'Mario Kart 64', '/game-covers/mario64.png'),
  game('papas-burgeria', "Papa's Burgeria", '/game-covers/burgeria.png'),
  game('papas-cheeseria', "Papa's Cheeseria", '/game-covers/cheeseria.png'),
  game('papas-freezeria', "Papa's Freezeria", '/game-covers/freezeria.png'),
  game('papas-hot-doggeria', "Papa's Hot Doggeria", '/game-covers/hotdog.png'),
  game('papas-pancakeria', "Papa's Pancakeria", '/game-covers/pancakeria.png'),
  game('papas-pastaria', "Papa's Pastaria", '/game-covers/pasta.png'),
  game('papas-scooperia', "Papa's Scooperia", '/game-covers/scooperia.png'),
  game('paper-io-3d', 'Paper.io 3D', '/game-covers/paper3d.png'),
  game('plants-vs-zombies-2', 'Plants vs. Zombies 2', '/game-covers/plants-vs-zombies-2.png'),
  game('ragdoll-hit', 'Ragdoll Hit', '/game-covers/rhit.png'),
]
