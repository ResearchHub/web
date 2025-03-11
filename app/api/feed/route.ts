import { NextRequest, NextResponse } from 'next/server';

// Mock data for the feed
const mockFeedEntries = [
  {
    id: 1,
    content_type: 'PAPER',
    content_object: {
      id: 101,
      title: 'Advances in Machine Learning',
      abstract: 'This paper explores recent advances in machine learning techniques.',
      content_type: 'paper',
      slug: 'advances-in-machine-learning',
      created_date: new Date().toISOString(),
      authors: [
        {
          id: 201,
          first_name: 'Jane',
          last_name: 'Smith',
          profile_image: 'https://randomuser.me/api/portraits/women/1.jpg',
          description: 'AI Researcher',
          user: {
            id: 301,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            is_verified: true,
          },
        },
      ],
      metrics: {
        votes: 25,
        comments: 10,
        reposts: 5,
        saves: 15,
      },
      hub: {
        id: 401,
        name: 'Machine Learning',
        slug: 'machine-learning',
      },
      unified_document: {
        id: 101,
        document_type: 'PAPER',
      },
    },
    created_date: new Date().toISOString(),
    action: 'PUBLISH',
    action_date: new Date().toISOString(),
    author: {
      id: 201,
      first_name: 'Jane',
      last_name: 'Smith',
      profile_image: 'https://randomuser.me/api/portraits/women/1.jpg',
      description: 'AI Researcher',
      user: {
        id: 301,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        is_verified: true,
      },
    },
  },
  {
    id: 2,
    content_type: 'BOUNTY',
    content_object: {
      id: 102,
      title: 'Need help with research review',
      bounty_type: 'REVIEW',
      amount: 50,
      status: 'OPEN',
      expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paper: {
        id: 103,
        title: 'Original Research Paper',
        content_type: 'paper',
        slug: 'original-research-paper',
        created_date: new Date().toISOString(),
        authors: [
          {
            id: 202,
            first_name: 'John',
            last_name: 'Doe',
            profile_image: 'https://randomuser.me/api/portraits/men/1.jpg',
            description: 'Computer Science Researcher',
            user: {
              id: 302,
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com',
              is_verified: true,
            },
          },
        ],
        metrics: {
          votes: 15,
          comments: 5,
          reposts: 2,
          saves: 8,
        },
        hub: {
          id: 402,
          name: 'Computer Science',
          slug: 'computer-science',
        },
        unified_document: {
          id: 103,
          document_type: 'PAPER',
        },
      },
      hub: {
        id: 402,
        name: 'Computer Science',
        slug: 'computer-science',
      },
      metrics: {
        votes: 10,
        comments: 3,
        reposts: 1,
        saves: 5,
      },
    },
    created_date: new Date().toISOString(),
    action: 'OPEN',
    action_date: new Date().toISOString(),
    author: {
      id: 202,
      first_name: 'John',
      last_name: 'Doe',
      profile_image: 'https://randomuser.me/api/portraits/men/1.jpg',
      description: 'Computer Science Researcher',
      user: {
        id: 302,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        is_verified: true,
      },
    },
  },
  {
    id: 3,
    content_type: 'PAPER',
    content_object: {
      id: 104,
      title: 'Quantum Computing Breakthroughs',
      abstract: 'This paper discusses recent breakthroughs in quantum computing.',
      content_type: 'paper',
      slug: 'quantum-computing-breakthroughs',
      created_date: new Date().toISOString(),
      authors: [
        {
          id: 203,
          first_name: 'Robert',
          last_name: 'Johnson',
          profile_image: 'https://randomuser.me/api/portraits/men/2.jpg',
          description: 'Quantum Physicist',
          user: {
            id: 303,
            first_name: 'Robert',
            last_name: 'Johnson',
            email: 'robert@example.com',
            is_verified: true,
          },
        },
      ],
      metrics: {
        votes: 30,
        comments: 12,
        reposts: 8,
        saves: 20,
      },
      hub: {
        id: 403,
        name: 'Quantum Physics',
        slug: 'quantum-physics',
      },
      unified_document: {
        id: 104,
        document_type: 'PAPER',
      },
    },
    created_date: new Date().toISOString(),
    action: 'PUBLISH',
    action_date: new Date().toISOString(),
    author: {
      id: 203,
      first_name: 'Robert',
      last_name: 'Johnson',
      profile_image: 'https://randomuser.me/api/portraits/men/2.jpg',
      description: 'Quantum Physicist',
      user: {
        id: 303,
        first_name: 'Robert',
        last_name: 'Johnson',
        email: 'robert@example.com',
        is_verified: true,
      },
    },
  },
];

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');
  const feedView = searchParams.get('feed_view') || 'popular';
  const hubSlug = searchParams.get('hub_slug');

  console.log('Mock API: Received request for feed', { page, pageSize, feedView, hubSlug });

  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data
  return NextResponse.json({
    count: mockFeedEntries.length,
    next: page < 2 ? `?page=${page + 1}&page_size=${pageSize}` : null,
    previous: page > 1 ? `?page=${page - 1}&page_size=${pageSize}` : null,
    results: mockFeedEntries,
  });
}
