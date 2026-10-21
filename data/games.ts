export type Game = { slug: string; title: string; category: string; cover: string; path: string }

const game = (slug: string, title: string, cover: string): Game => ({ slug, title, category: 'Featured', cover, path: `/games/${slug}.html` })

export const games: Game[] = [
  game('1v1-lol', '1v1.LOL', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80'),
  game('plants-vs-zombies-2', 'Plants vs. Zombies 2', 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=900&q=80'),
  game('angry-birdsspace', 'Angry Birds Space', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80'),
  game('baldis-basics', "Baldi's Basics", 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80'),
  game('bloons-td5', 'Bloons TD 5', 'https://images.unsplash.com/photo-1605870445919-838d7b1dbe1a?auto=format&fit=crop&w=900&q=80'),
  game('cactus-mccoy', 'Cactus McCoy', 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=900&q=80'),
  game('kirby-soft-and-wet', 'Kirby: Soft and Wet', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80'),
  game('mario-kart-64', 'Mario Kart 64', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80'),
  game('papas-pastaria', "Papa's Pastaria", 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80'),
  game('papas-scooperia', "Papa's Scooperia", 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=80'),
  game('papas-burgeria', "Papa's Burgeria", 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'),
  game('paper-io-3d', 'Paper.io 3D', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80'),
  game('papas-cheeseria', "Papa's Cheeseria", 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=900&q=80'),
  game('papas-pancakeria', "Papa's Pancakeria", 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80'),
  game('papas-hot-doggeria', "Papa's Hot Doggeria", 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=900&q=80'),
  game('papas-freezeria', "Papa's Freezeria", 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=80'),
  game('ragdoll-hit', 'Ragdoll Hit', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80'),
  game('basket-random', 'Basket Random', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'),
  game('among-us', 'Among Us', 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?auto=format&fit=crop&w=900&q=80'),
]
