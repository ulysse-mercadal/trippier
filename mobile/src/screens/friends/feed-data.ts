// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Static shape of a single feed post rendered in the friends feed sub-view.
 */
export interface FeedPost {
  id: string;
  author: string;
  location: string;
  when: string;
  caption: string;
  likes: number;
  comments: number;
}

/**
 * Stub feed posts surfaced in wave 4 until the social feed backend lands.
 *
 * @returns The frozen list of mock posts.
 */
// data: stub for wave 4 — wire when backend ready
export function getMockPosts(): readonly FeedPost[] {
  return [
    {
      id: 'post-1',
      author: 'Marta Lopes',
      location: 'Lisbon',
      when: '2h',
      caption: 'Belém was a hit — the pastéis live up to the hype.',
      likes: 23,
      comments: 7,
    },
    {
      id: 'post-2',
      author: 'Tomás Reyes',
      location: 'Reykjavik',
      when: '6h',
      caption: 'Aurora Kp7 tonight. Driving out to escape the city glow.',
      likes: 89,
      comments: 14,
    },
    {
      id: 'post-3',
      author: 'Camille Bernard',
      location: 'Barcelona',
      when: 'yesterday',
      caption: 'Sant Pau is the prettiest hospital I have ever walked through.',
      likes: 42,
      comments: 3,
    },
    {
      id: 'post-4',
      author: 'Yuki Tanaka',
      location: 'Kyoto',
      when: '2d',
      caption: 'Fushimi Inari before sunrise — empty trails, all the foxes.',
      likes: 156,
      comments: 22,
    },
  ];
}

export const MOCK_POSTS: readonly FeedPost[] = getMockPosts();
