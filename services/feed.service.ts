import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';
import { Bounty, BountyType, transformBounty } from '@/types/bounty';
import { transformUser } from '@/types/user';
import { transformAuthorProfile } from '@/types/authorProfile';
import { Fundraise, transformFundraise } from '@/types/funding';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';
  private static readonly FUNDING_PATH = '/api/funding_feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: string;
    hubSlug?: string;
    contentType?: string;
    source?: 'all' | 'researchhub';
    endpoint?: 'feed' | 'funding_feed';
    fundraiseStatus?: 'OPEN' | 'CLOSED';
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);
    if (params?.contentType) queryParams.append('content_type', params.contentType);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.fundraiseStatus) queryParams.append('fundraise_status', params.fundraiseStatus);

    // Determine which endpoint to use
    const basePath = params?.endpoint === 'funding_feed' ? this.FUNDING_PATH : this.BASE_PATH;
    const url = `${basePath}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      // Use ApiClient for both server and client environments
      const isServer = typeof window === 'undefined';
      console.log(`Fetching feed from URL: ${url} (${isServer ? 'server-side' : 'client-side'})`);

      const response = await ApiClient.get<FeedApiResponse>(url);

      // const response = {
      //   count: 74378,
      //   next: 'https://backend.prod.researchhub.com/api/feed/?feed_view=popular&page=2&page_size=20&source=all',
      //   previous: null,
      //   results: [
      //     {
      //       id: 2198065,
      //       content_type: 'RESEARCHHUBPOST',
      //       content_object: {
      //         id: 4070,
      //         hub: null,
      //         slug: 'podcast-peer-review-and-rating-andrew-huberman-and-robert-sapolsky',
      //         type: 'DISCUSSION',
      //         title: 'Podcast Peer-Review and Rating: Andrew Huberman and Robert Sapolsky',
      //         reviews: [],
      //         bounties: [
      //           {
      //             id: 4297,
      //             hub: null,
      //             amount: '1000.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [
      //               {
      //                 id: 956713,
      //                 user: {
      //                   id: 36837,
      //                   email: 'cryptyler24@gmail.com',
      //                   last_name: 'D.',
      //                   first_name: 'Tyler',
      //                   is_verified: true,
      //                 },
      //                 headline: 'Brain Biomechanics Researcher',
      //                 last_name: 'Diorio',
      //                 first_name: 'Tyler',
      //                 profile_image:
      //                   'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/08/09/blob_im4Dh4d',
      //               },
      //               {
      //                 id: 993107,
      //                 user: {
      //                   id: 60018,
      //                   email: 'domi@dreambrook.tech',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   is_verified: true,
      //                 },
      //                 headline:
      //                   'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                 last_name: 'Brian',
      //                 first_name: 'Dominikus',
      //                 profile_image:
      //                   'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //               },
      //               {
      //                 id: 932947,
      //                 user: {
      //                   id: 34416,
      //                   email: 'jkour002@ucr.edu',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   is_verified: true,
      //                 },
      //                 headline:
      //                   'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                 last_name: 'Koury',
      //                 first_name: 'Jeffrey',
      //                 profile_image:
      //                   'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //               },
      //             ],
      //             contributions: [
      //               {
      //                 id: 4297,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4299,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4300,
      //                 amount: 200,
      //                 author: {
      //                   id: 956713,
      //                   user: {
      //                     id: 36837,
      //                     email: 'cryptyler24@gmail.com',
      //                     last_name: 'D.',
      //                     first_name: 'Tyler',
      //                     is_verified: true,
      //                   },
      //                   headline: 'Brain Biomechanics Researcher',
      //                   last_name: 'Diorio',
      //                   first_name: 'Tyler',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/08/09/blob_im4Dh4d',
      //                 },
      //               },
      //               {
      //                 id: 4302,
      //                 amount: 200,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T03:09:30.004606Z',
      //           },
      //           {
      //             id: 4299,
      //             hub: null,
      //             amount: '1000.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4297,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4299,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4300,
      //                 amount: 200,
      //                 author: {
      //                   id: 956713,
      //                   user: {
      //                     id: 36837,
      //                     email: 'cryptyler24@gmail.com',
      //                     last_name: 'D.',
      //                     first_name: 'Tyler',
      //                     is_verified: true,
      //                   },
      //                   headline: 'Brain Biomechanics Researcher',
      //                   last_name: 'Diorio',
      //                   first_name: 'Tyler',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/08/09/blob_im4Dh4d',
      //                 },
      //               },
      //               {
      //                 id: 4302,
      //                 amount: 200,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T03:09:30.004606Z',
      //           },
      //           {
      //             id: 4300,
      //             hub: null,
      //             amount: '1000.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4297,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4299,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4300,
      //                 amount: 200,
      //                 author: {
      //                   id: 956713,
      //                   user: {
      //                     id: 36837,
      //                     email: 'cryptyler24@gmail.com',
      //                     last_name: 'D.',
      //                     first_name: 'Tyler',
      //                     is_verified: true,
      //                   },
      //                   headline: 'Brain Biomechanics Researcher',
      //                   last_name: 'Diorio',
      //                   first_name: 'Tyler',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/08/09/blob_im4Dh4d',
      //                 },
      //               },
      //               {
      //                 id: 4302,
      //                 amount: 200,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T03:09:30.004606Z',
      //           },
      //           {
      //             id: 4302,
      //             hub: null,
      //             amount: '1000.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4297,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4299,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4300,
      //                 amount: 200,
      //                 author: {
      //                   id: 956713,
      //                   user: {
      //                     id: 36837,
      //                     email: 'cryptyler24@gmail.com',
      //                     last_name: 'D.',
      //                     first_name: 'Tyler',
      //                     is_verified: true,
      //                   },
      //                   headline: 'Brain Biomechanics Researcher',
      //                   last_name: 'Diorio',
      //                   first_name: 'Tyler',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/08/09/blob_im4Dh4d',
      //                 },
      //               },
      //               {
      //                 id: 4302,
      //                 amount: 200,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T03:09:30.004606Z',
      //           },
      //         ],
      //         fundraise: null,
      //         image_url: null,
      //         created_date: '2025-04-14T03:02:37.556015Z',
      //         renderable_text:
      //           'Please rate and review the following episode of the Huberman Lab podcast between Drs. Andrew Huberman and Robert Sapolsky discussing the neuro-biological nature of stress, free-will, and other related topics. For details on rating and reviewing, see the g...',
      //       },
      //       created_date: '2025-04-14T03:02:38.374431Z',
      //       action_date: '2025-04-14T03:02:37.556015Z',
      //       action: 'PUBLISH',
      //       author: {
      //         id: 7631880,
      //         first_name: 'Sean',
      //         last_name: 'McCracken',
      //         profile_image:
      //           'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //         headline:
      //           "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //         user: {
      //           id: 114322,
      //           first_name: 'Sean',
      //           last_name: 'McCracken',
      //           email: 'smccracken@wustl.edu',
      //           is_verified: false,
      //         },
      //       },
      //       metrics: {
      //         votes: 11,
      //         replies: 3,
      //       },
      //     },
      //     {
      //       id: 2216594,
      //       content_type: 'RESEARCHHUBPOST',
      //       content_object: {
      //         id: 4073,
      //         hub: null,
      //         slug: 'emergent-models-machine-learning-from-cellular-automata',
      //         type: 'DISCUSSION',
      //         title: 'Emergent Models: Machine Learning from Cellular Automata',
      //         reviews: [],
      //         bounties: [],
      //         fundraise: null,
      //         image_url: null,
      //         created_date: '2025-04-15T11:23:58.160069Z',
      //         renderable_text:
      //           'Short introIn collaboration with my startup BrightStarLabs and Wolfram Institute, I theorized a new kind of Machine Learning model that uses Cellular Automata (or any other dynamical system) as a general mean of modeling, substituting Neural Networks.Note...',
      //       },
      //       created_date: '2025-04-15T11:23:58.506417Z',
      //       action_date: '2025-04-15T11:23:58.160069Z',
      //       action: 'PUBLISH',
      //       author: {
      //         id: 7677667,
      //         first_name: 'Giacomo',
      //         last_name: 'Bocchese',
      //         profile_image:
      //           'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/09/blob_vKN58lt',
      //         headline: 'Affiliated Researcher @Wolfram Institute , Founder @BrightStarLabs.ai',
      //         user: {
      //           id: 115346,
      //           first_name: 'Giacomo',
      //           last_name: 'Bocchese',
      //           email: 'bocchesegiacomo01@gmail.com',
      //           is_verified: false,
      //         },
      //       },
      //       metrics: {
      //         votes: 15,
      //         replies: 14,
      //       },
      //     },
      //     {
      //       id: 2198042,
      //       content_type: 'RESEARCHHUBPOST',
      //       content_object: {
      //         id: 4069,
      //         hub: null,
      //         slug: 'podcast-peer-review-and-rating-andrew-huberman-and-karl-deisseroth',
      //         type: 'DISCUSSION',
      //         title: 'Podcast Peer-Review and Rating: Andrew Huberman and Karl Deisseroth',
      //         reviews: [
      //           {
      //             id: 6961,
      //             score: 4,
      //             author: {
      //               id: 1871571,
      //               user: {
      //                 id: 65716,
      //                 email: 'docdw@cosmicevolution.net',
      //                 last_name: 'Warmflash',
      //                 first_name: 'David',
      //                 is_verified: false,
      //               },
      //               headline: 'medicine, aerospace physiology, genetics, astrobiology',
      //               last_name: 'Warmflash',
      //               first_name: 'David',
      //               profile_image:
      //                 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/05/blob_77t7OdU',
      //             },
      //           },
      //         ],
      //         bounties: [
      //           {
      //             id: 4296,
      //             hub: null,
      //             amount: '750.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [
      //               {
      //                 id: 993107,
      //                 user: {
      //                   id: 60018,
      //                   email: 'domi@dreambrook.tech',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   is_verified: true,
      //                 },
      //                 headline:
      //                   'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                 last_name: 'Brian',
      //                 first_name: 'Dominikus',
      //                 profile_image:
      //                   'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //               },
      //               {
      //                 id: 932947,
      //                 user: {
      //                   id: 34416,
      //                   email: 'jkour002@ucr.edu',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   is_verified: true,
      //                 },
      //                 headline:
      //                   'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                 last_name: 'Koury',
      //                 first_name: 'Jeffrey',
      //                 profile_image:
      //                   'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //               },
      //             ],
      //             contributions: [
      //               {
      //                 id: 4296,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4298,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4316,
      //                 amount: 150,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T02:56:57.631823Z',
      //           },
      //           {
      //             id: 4298,
      //             hub: null,
      //             amount: '750.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4296,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4298,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4316,
      //                 amount: 150,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T02:56:57.631823Z',
      //           },
      //           {
      //             id: 4316,
      //             hub: null,
      //             amount: '750.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4296,
      //                 amount: 150,
      //                 author: {
      //                   id: 7631880,
      //                   user: {
      //                     id: 114322,
      //                     email: 'smccracken@wustl.edu',
      //                     last_name: 'McCracken',
      //                     first_name: 'Sean',
      //                     is_verified: false,
      //                   },
      //                   headline:
      //                     "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //                   last_name: 'McCracken',
      //                   first_name: 'Sean',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //                 },
      //               },
      //               {
      //                 id: 4298,
      //                 amount: 450,
      //                 author: {
      //                   id: 932947,
      //                   user: {
      //                     id: 34416,
      //                     email: 'jkour002@ucr.edu',
      //                     last_name: 'Koury',
      //                     first_name: 'Jeffrey',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'President and Director at ResearchHub Foundation | PhD in Biomedical Sciences',
      //                   last_name: 'Koury',
      //                   first_name: 'Jeffrey',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      //                 },
      //               },
      //               {
      //                 id: 4316,
      //                 amount: 150,
      //                 author: {
      //                   id: 993107,
      //                   user: {
      //                     id: 60018,
      //                     email: 'domi@dreambrook.tech',
      //                     last_name: 'Brian',
      //                     first_name: 'Dominikus',
      //                     is_verified: true,
      //                   },
      //                   headline:
      //                     'Applied AI R&D @ ResearchHub Foundation | Editor for Materials Science | ResearchPreneur | Founder and CTO of DreamBrook Labs',
      //                   last_name: 'Brian',
      //                   first_name: 'Dominikus',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
      //                 },
      //               },
      //             ],
      //             document_type: 'DISCUSSION',
      //             expiration_date: '2025-04-28T02:56:57.631823Z',
      //           },
      //         ],
      //         fundraise: null,
      //         image_url: null,
      //         created_date: '2025-04-14T02:26:39.468971Z',
      //         renderable_text:
      //           'Please rate and review this episode of the Huberman Lab Podcast between Drs. Andrew Huberman and Karl Deisseroth, where they discuss the mind from the perspectives of both psychiatry and neuroscience.  For details on rating and reviewing, see the grant at...',
      //       },
      //       created_date: '2025-04-14T02:26:40.427890Z',
      //       action_date: '2025-04-14T02:26:39.468971Z',
      //       action: 'PUBLISH',
      //       author: {
      //         id: 7631880,
      //         first_name: 'Sean',
      //         last_name: 'McCracken',
      //         profile_image:
      //           'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
      //         headline:
      //           "Ph.D. In Neuroscience (Wash U 24'), B.S.E. In Chemical and Biomolecular Engineering (JHU 19'). Founder of NeuroReview. ",
      //         user: {
      //           id: 114322,
      //           first_name: 'Sean',
      //           last_name: 'McCracken',
      //           email: 'smccracken@wustl.edu',
      //           is_verified: false,
      //         },
      //       },
      //       metrics: {
      //         votes: 7,
      //         replies: 2,
      //       },
      //     },
      //     {
      //       id: 2197519,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9379296,
      //         doi: '10.26434/chemrxiv-2025-01d4z',
      //         hub: {
      //           name: 'Organic Chemistry',
      //           slug: 'organic-chemistry',
      //         },
      //         slug: 'highly-enantioselective-reductions-of-2h-azirines',
      //         title: 'Highly Enantioselective Reductions of 2H-Azirines',
      //         authors: [
      //           {
      //             id: 1201815,
      //             user: null,
      //             headline: null,
      //             last_name: 'Shi',
      //             first_name: 'Yongjie',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4846455,
      //             user: null,
      //             headline: null,
      //             last_name: 'Rizzo',
      //             first_name: 'Antonio',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4846456,
      //             user: null,
      //             headline: null,
      //             last_name: 'Chiu',
      //             first_name: 'Pauline',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731933,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zheng',
      //             first_name: 'Yinuo',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731934,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ng',
      //             first_name: 'Elvis',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           'Herein, we present the first highly enantioselective reduction of mono- and tri- substituted 2H-azirines mediated by a chiral copper-hydride complex. The reaction tolerates both alkylated and arylated 2H-azirines to afford free N-H aziridines in excellent yield (up to 96%) and enantioselectivity (up to 96% ee). A key finding was the stark difference in copper complex structure necessary for the enantioselective reduction of mono- versus tri- substituted 2H-azirines. Finally, we demonstrate the synthetic value of this reduction for the preparation of bioactive molecules',
      //         bounties: [
      //           {
      //             id: 4315,
      //             hub: {
      //               name: 'Organic Chemistry',
      //               slug: 'organic-chemistry',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4315,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-29T00:53:41.848572Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0001-6363-5108',
      //             countries: ['HK'],
      //             last_name: 'Zheng',
      //             first_name: 'Yinuo',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I889458895'],
      //                 raw_affiliation_string: 'The University of Hong Kong',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5043706318',
      //             raw_author_name: 'Yinuo Zheng',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['The University of Hong Kong'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-7189-8717',
      //             countries: ['HK'],
      //             last_name: 'Ng',
      //             first_name: 'Elvis',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I889458895'],
      //                 raw_affiliation_string: 'The University of Hong Kong',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5032928208',
      //             raw_author_name: 'Elvis Wang Hei Ng',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['The University of Hong Kong'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-3845-5505',
      //             countries: ['HK'],
      //             last_name: 'Shi',
      //             first_name: 'Yongjie',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I889458895'],
      //                 raw_affiliation_string: 'The University of Hong Kong',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5084446922',
      //             raw_author_name: 'Yongjie Shi',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['The University of Hong Kong'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-3626-9429',
      //             countries: ['HK'],
      //             last_name: 'Rizzo',
      //             first_name: 'Antonio',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I889458895'],
      //                 raw_affiliation_string: 'The University of Hong Kong',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5081003308',
      //             raw_author_name: 'Antonio Rizzo',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['The University of Hong Kong'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-5081-4756',
      //             countries: ['HK'],
      //             last_name: 'Chiu',
      //             first_name: 'Pauline',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I889458895'],
      //                 raw_affiliation_string: 'The University of Hong Kong',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5061384788',
      //             raw_author_name: 'Pauline Chiu',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['The University of Hong Kong'],
      //           },
      //         ],
      //         created_date: '2025-04-13T10:32:49.017701Z',
      //       },
      //       created_date: '2025-04-13T10:39:32.279689Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 7,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2197534,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9379297,
      //         doi: '10.26434/chemrxiv-2025-2l3d9-v2',
      //         hub: {
      //           name: 'Inorganic Chemistry',
      //           slug: 'inorganic-chemistry',
      //         },
      //         slug: 'covalent-bonding-of-molecular-catalysts-to-metal-oxide-supports-via-transesterification-leads-to-high-loading-and-tunable-hybrid-nickel-catalysts',
      //         title:
      //           'Covalent Bonding of Molecular Catalysts to Metal Oxide Supports via Transesterification Leads to High Loading and Tunable Hybrid Nickel Catalysts',
      //         authors: [
      //           {
      //             id: 4281938,
      //             user: null,
      //             headline: null,
      //             last_name: 'Dissanayake',
      //             first_name: 'D.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4717507,
      //             user: null,
      //             headline: null,
      //             last_name: 'Regalbuto',
      //             first_name: 'John',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5107185,
      //             user: null,
      //             headline: null,
      //             last_name: 'Vannucci',
      //             first_name: 'Aaron',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731935,
      //             user: null,
      //             headline: null,
      //             last_name: 'Kuchta',
      //             first_name: 'Joseph',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731936,
      //             user: null,
      //             headline: null,
      //             last_name: 'Moody',
      //             first_name: 'S.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731937,
      //             user: null,
      //             headline: null,
      //             last_name: 'Bradbury',
      //             first_name: 'A.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731938,
      //             user: null,
      //             headline: null,
      //             last_name: 'Balijepalli',
      //             first_name: 'S.',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           'The synthesis, characterization, and structure-function properties for a new class of hybrid catalysts comprised of molecular catalysts covalently bound to metal oxide (MOx) supports via metal-ester bonds is reported. The synthesis of this new class of catalysts is able to achieve targeted and predictable catalyst loading with maximum aerial surface loadings of two uniform, single-site catalysts per nm² of support. X-ray, infrared, and electron paramagnetic spectroscopic characterizations and catalytic reactivity trends show that the MOx support influences the molecular catalyst properties and reactivity through electronic induction effects. The influence of the support on catalytic properties has been correlated to the point of zero charge (PZC) and shown to be predictable. Thus, this class of hybrid catalysts can be tuned by both the structure of the molecular catalyst and by the choice of oxide support. This allows for precise control of the catalyst nucleation, coordination environment, and accessible oxidation states, enabling highly tailored and controllable catalytic properties.',
      //         bounties: [
      //           {
      //             id: 4317,
      //             hub: {
      //               name: 'Inorganic Chemistry',
      //               slug: 'inorganic-chemistry',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4317,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-29T19:44:24.597522Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: null,
      //             countries: ['US'],
      //             last_name: 'Kuchta',
      //             first_name: 'Joseph',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5022728202',
      //             raw_author_name: 'Joseph J. Kuchta III',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['US'],
      //             last_name: 'Moody',
      //             first_name: 'S.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5035511873',
      //             raw_author_name: 'Sarah M. Moody',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['US'],
      //             last_name: 'Bradbury',
      //             first_name: 'A.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5004271991',
      //             raw_author_name: 'Alexia M. Bradbury',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-6213-5782',
      //             countries: ['US'],
      //             last_name: 'Dissanayake',
      //             first_name: 'D.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5040806382',
      //             raw_author_name: 'D. M. S. C. Dissanayake',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-1188-6831',
      //             countries: ['US'],
      //             last_name: 'Balijepalli',
      //             first_name: 'S.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5005948159',
      //             raw_author_name: 'Santosh K. Balijepalli',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-5785-0749',
      //             countries: ['US'],
      //             last_name: 'Regalbuto',
      //             first_name: 'John',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5060877593',
      //             raw_author_name: 'John R. Regalbuto',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-0401-7208',
      //             countries: ['US'],
      //             last_name: 'Vannucci',
      //             first_name: 'Aaron',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I155781252'],
      //                 raw_affiliation_string: 'University of South Carolina',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5088162271',
      //             raw_author_name: 'Aaron K. Vannucci',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of South Carolina'],
      //           },
      //         ],
      //         created_date: '2025-04-13T10:35:26.398037Z',
      //       },
      //       created_date: '2025-04-13T10:39:54.179029Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2197512,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9379295,
      //         doi: '10.26434/chemrxiv-2025-hwsl2',
      //         hub: {
      //           name: 'Catalysis',
      //           slug: 'catalysis',
      //         },
      //         slug: 'metal-organic-framework-organocatalyst-combination-as-powerful-biomimetic-multi-catalytic-systems-for-aerobic-oxidations',
      //         title:
      //           'Metal-Organic Framework-Organocatalyst Combination as Powerful Biomimetic Multi-Catalytic Systems for Aerobic Oxidations',
      //         authors: [
      //           {
      //             id: 2611167,
      //             user: null,
      //             headline: null,
      //             last_name: 'Mopoung',
      //             first_name: 'Kunpot',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3111849,
      //             user: null,
      //             headline: null,
      //             last_name: 'Arango‐Daza',
      //             first_name: 'Juan',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3111850,
      //             user: null,
      //             headline: null,
      //             last_name: 'Rivero‐Crespo',
      //             first_name: 'Miguel',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5773659,
      //             user: null,
      //             headline: null,
      //             last_name: 'Puttisong',
      //             first_name: 'Yuttapoom',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731931,
      //             user: null,
      //             headline: null,
      //             last_name: 'Onillon',
      //             first_name: 'Mathieu',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731932,
      //             user: null,
      //             headline: null,
      //             last_name: 'Nork',
      //             first_name: 'Leonie',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           'Aerobic oxidation using molecular oxygen as terminal oxidant represents a sustainable route to access valuable organic compounds. However, achieving high selectivity in such transformations remains challenging. Here, we report a robust and modular biomimetic multicatalytic system combining a MOF and a simple hydroxyaromatic co-catalyst, which mimics the cooperative action of enzyme–coenzyme pairs in a confined environment. A Zr-based (MOF-808) semiheterogeneous system enables the selective aerobic oxidation of anilines to azoxybenzenes, products that are typically elusive under aerobic conditions, with excellent yields and selectivity, reaching up to 93%. The cooperative interplay between MOF and organic co-catalyst triggers ligand-to-metal charge transfer, generating reactive oxygen species under mild conditions without the need for light or other external stimuli. The generality of this novel approach is further demonstrated by applying it to a Ti-MOF (MIL-125) to achieve aerobic oxidative coupling of benzylamines. This work highlights the untapped potential of MOF-organocatalyst combinations to drive challenging reactions under environmentally benign conditions.',
      //         bounties: [
      //           {
      //             id: 4318,
      //             hub: {
      //               name: 'Catalysis',
      //               slug: 'catalysis',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4318,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-29T19:44:32.976342Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0002-8209-0622',
      //             countries: ['SE'],
      //             last_name: 'Arango‐Daza',
      //             first_name: 'Juan',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I161593684'],
      //                 raw_affiliation_string: 'Stockholm University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5033388612',
      //             raw_author_name: 'Juan Camilo Arango-Daza',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Stockholm University'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['SE'],
      //             last_name: 'Onillon',
      //             first_name: 'Mathieu',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I161593684'],
      //                 raw_affiliation_string: 'Stockholm University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5116856907',
      //             raw_author_name: 'Mathieu Onillon',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Stockholm University'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['SE'],
      //             last_name: 'Nork',
      //             first_name: 'Leonie',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I161593684'],
      //                 raw_affiliation_string: 'Stockholm University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5116856908',
      //             raw_author_name: 'Leonie Nork',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Stockholm University'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-4059-0669',
      //             countries: ['SE'],
      //             last_name: 'Mopoung',
      //             first_name: 'Kunpot',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I102134673'],
      //                 raw_affiliation_string: 'Linköping University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5054276385',
      //             raw_author_name: 'Kunpot Mopoung',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Linköping University'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-9690-6231',
      //             countries: ['SE'],
      //             last_name: 'Puttisong',
      //             first_name: 'Yuttapoom',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I102134673'],
      //                 raw_affiliation_string: 'Linköping University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5001674286',
      //             raw_author_name: 'Yuttapoom Puttisong',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Linköping University'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-3860-0947',
      //             countries: ['SE'],
      //             last_name: 'Rivero‐Crespo',
      //             first_name: 'Miguel',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I161593684'],
      //                 raw_affiliation_string: 'Stockholm University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5062995772',
      //             raw_author_name: 'Miguel A. Rivero-Crespo',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Stockholm University'],
      //           },
      //         ],
      //         created_date: '2025-04-13T10:29:19.013517Z',
      //       },
      //       created_date: '2025-04-13T10:39:07.392078Z',
      //       action_date: '2025-03-31T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2197502,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9379294,
      //         doi: '10.26434/chemrxiv-2025-llx1m',
      //         hub: {
      //           name: 'Renewable Energy, Sustainability And The Environment',
      //           slug: 'renewable-energy-sustainability-and-the-environment',
      //         },
      //         slug: 'photocatalytic-versus-stoichiometric-hydrogen-generation-using-mesoporous-silicon-catalysts-the-complex-role-of-sacrificial-reagents',
      //         title:
      //           'Photocatalytic versus Stoichiometric Hydrogen Generation using Mesoporous Silicon Catalysts: The Complex Role of Sacrificial Reagents',
      //         authors: [
      //           {
      //             id: 2234909,
      //             user: null,
      //             headline: null,
      //             last_name: 'Martell',
      //             first_name: 'Sarah',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2234914,
      //             user: null,
      //             headline: null,
      //             last_name: 'Dasog',
      //             first_name: 'Mita',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731928,
      //             user: null,
      //             headline: null,
      //             last_name: 'Putwa',
      //             first_name: 'Sarrah',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731929,
      //             user: null,
      //             headline: null,
      //             last_name: 'Reis',
      //             first_name: 'Berthold',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731930,
      //             user: null,
      //             headline: null,
      //             last_name: 'Schwarz',
      //             first_name: 'Simona',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           "Mesoporous silicon has emerged as a promising photocatalyst for solar-driven hydrogen production via water splitting. However, its cyclability and stability are poor due to oxidation of silicon during the reaction, which also results in stoichiometric amounts of hydrogen. Despite this, the exact contribution of stoichiometric component in the reaction remains unknown. This study demonstrates that the stoichiometric hydrogen contribution when using silicon photocatalysts is dependent on the type of sacrificial reagent. In the presence of triethanolamine and sodium sulfite, which increase the solution's pH, over 90% of the hydrogen produced originates from the stoichiometric reaction. In contrast, when alcohol-based sacrificial reagents are used, the ratio of catalytic to stoichiometric hydrogen depends on the size of the alcohol molecule. Smaller alcohols, such as methanol and ethanol, result in higher overall hydrogen production; however, more than 40% of it originates from the stoichiometric reaction of silicon with water. As the alcohol size increases, the amount of water near the catalyst surface is limited, leading to decreased hydrogen production rates but improved photocatalyst stability. This study highlights the major role of the undesirable side reactions in silicon based photocatalysis and the need for more rigorous hydrogen quantification protocols to determine true photocatalytic activity.",
      //         bounties: [
      //           {
      //             id: 4319,
      //             hub: {
      //               name: 'Renewable Energy, Sustainability And The Environment',
      //               slug: 'renewable-energy-sustainability-and-the-environment',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4319,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-29T19:44:36.148136Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: null,
      //             countries: ['CA'],
      //             last_name: 'Putwa',
      //             first_name: 'Sarrah',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I129902397'],
      //                 raw_affiliation_string: 'Dalhousie University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5002508769',
      //             raw_author_name: 'Sarrah Putwa',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Dalhousie University'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-0393-1228',
      //             countries: ['CA'],
      //             last_name: 'Martell',
      //             first_name: 'Sarah',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I129902397'],
      //                 raw_affiliation_string: 'Dalhousie University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5073009194',
      //             raw_author_name: 'Sarah Martell',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Dalhousie University'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-0918-5764',
      //             countries: [],
      //             last_name: 'Reis',
      //             first_name: 'Berthold',
      //             affiliations: [
      //               {
      //                 institution_ids: [],
      //                 raw_affiliation_string: 'Leibniz institute of pol',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5065948676',
      //             raw_author_name: 'Berthold Reis',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Leibniz institute of pol'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['DE'],
      //             last_name: 'Schwarz',
      //             first_name: 'Simona',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210111834'],
      //                 raw_affiliation_string: 'Leibniz Institute of Polymer Research',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5113620234',
      //             raw_author_name: 'Simona Schwarz',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Leibniz Institute of Polymer Research'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['CA'],
      //             last_name: 'Dasog',
      //             first_name: 'Mita',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I129902397'],
      //                 raw_affiliation_string: 'Dalhousie University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5085111912',
      //             raw_author_name: 'Mita Dasog',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Dalhousie University'],
      //           },
      //         ],
      //         created_date: '2025-04-13T10:25:06.897927Z',
      //       },
      //       created_date: '2025-04-13T10:38:15.103697Z',
      //       action_date: '2025-03-28T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2197484,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9379293,
      //         doi: '10.26434/chemrxiv-2025-krwvb',
      //         hub: {
      //           name: 'Catalysis',
      //           slug: 'catalysis',
      //         },
      //         slug: 'sustainable-fuels-from-co2-rich-synthesis-gas-via-fischer-tropsch-technology',
      //         title: 'Sustainable Fuels from CO2-rich synthesis gas via Fischer-Tropsch technology',
      //         authors: [
      //           {
      //             id: 1881412,
      //             user: null,
      //             headline: null,
      //             last_name: 'Heeres',
      //             first_name: 'Hero',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4106864,
      //             user: null,
      //             headline: null,
      //             last_name: 'Bezemer',
      //             first_name: 'G.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4726530,
      //             user: null,
      //             headline: null,
      //             last_name: 'Vogt',
      //             first_name: 'Charlotte',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5747584,
      //             user: null,
      //             headline: null,
      //             last_name: 'Saeys',
      //             first_name: 'Mark',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7095515,
      //             user: null,
      //             headline: null,
      //             last_name: 'Rohrbach',
      //             first_name: 'Léon',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7194842,
      //             user: null,
      //             headline: null,
      //             last_name: 'Xie',
      //             first_name: 'Jingxiu',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731924,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jong',
      //             first_name: 'Bart',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731925,
      //             user: null,
      //             headline: null,
      //             last_name: 'Rommens',
      //             first_name: 'Konstantijn',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731926,
      //             user: null,
      //             headline: null,
      //             last_name: 'Rosner',
      //             first_name: 'Tal',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7731927,
      //             user: null,
      //             headline: null,
      //             last_name: 'Tempel',
      //             first_name: 'Paul',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           'CO2-containing synthesis gas is a relevant feedstock for the production of synthetic fuels using Fischer-Tropsch Synthesis. We report the role of CO2 in CO2, CO and H2 mixed feeds over a cobalt-based catalyst at 220 °C and 21 bar in a packed bed reactor. The C5+ selectivity remains above 78 % even for CO2-rich synthesis gas with 75 % CO2/(CO+CO2). Using 13CO2 isotopic labeling, the increase in methane selectivity is attributed to both CO and CO2 methanation, which is limited by maintaining a H2/CO outlet ratio below 10 and an outlet CO partial pressure above 0.2 bar, respectively. Operando modulated DRIFTS confirms a positive relationship between CO surface coverage and CO partial pressure. From DFT and microkinetic modeling, enhanced CO and CO2 methanation could be attributed to a lower CO surface coverage and a higher H2 surface coverage. This work identifies boundaries for efficient cobalt-catalyzed mixed-feed FTS for synthetic fuels production.',
      //         bounties: [
      //           {
      //             id: 4320,
      //             hub: {
      //               name: 'Catalysis',
      //               slug: 'catalysis',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4320,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-29T19:44:39.266095Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: null,
      //             countries: ['NL'],
      //             last_name: 'Jong',
      //             first_name: 'Bart',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I169381384'],
      //                 raw_affiliation_string: 'University of Groningen',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5110715182',
      //             raw_author_name: 'Bart de Jong',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Groningen'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-7547-6199',
      //             countries: ['BE'],
      //             last_name: 'Rommens',
      //             first_name: 'Konstantijn',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I2801227569'],
      //                 raw_affiliation_string: 'Ghent University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5031688661',
      //             raw_author_name: 'Konstantijn Rommens',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Ghent University'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['IL'],
      //             last_name: 'Rosner',
      //             first_name: 'Tal',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I174306211'],
      //                 raw_affiliation_string: 'Technion – Israel Institute of Technology',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5017068313',
      //             raw_author_name: 'Tal Rosner',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technion – Israel Institute of Technology'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-7475-4943',
      //             countries: ['NL'],
      //             last_name: 'Tempel',
      //             first_name: 'Paul',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I169381384'],
      //                 raw_affiliation_string: 'University of Groningen',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5025122192',
      //             raw_author_name: 'Paul van den Tempel',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Groningen'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-0108-6865',
      //             countries: ['NL'],
      //             last_name: 'Rohrbach',
      //             first_name: 'Léon',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I169381384'],
      //                 raw_affiliation_string: 'University of Groningen',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5065776261',
      //             raw_author_name: 'Léon Rohrbach',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Groningen'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-7344-9250',
      //             countries: ['NL'],
      //             last_name: 'Bezemer',
      //             first_name: 'G.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I7923278'],
      //                 raw_affiliation_string: 'Shell (Netherlands)',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5042471374',
      //             raw_author_name: 'Leendert Bezemer',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Shell (Netherlands)'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-1249-543X',
      //             countries: ['NL'],
      //             last_name: 'Heeres',
      //             first_name: 'Hero',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I169381384'],
      //                 raw_affiliation_string: 'University of Groningen',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5070039432',
      //             raw_author_name: 'Hero Jan Heeres',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Groningen'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-3426-6662',
      //             countries: ['BE'],
      //             last_name: 'Saeys',
      //             first_name: 'Mark',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I2801227569'],
      //                 raw_affiliation_string: 'Ghent University',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5047450222',
      //             raw_author_name: 'Mark Saeys',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Ghent University'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-0562-3237',
      //             countries: ['IL'],
      //             last_name: 'Vogt',
      //             first_name: 'Charlotte',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I174306211'],
      //                 raw_affiliation_string: 'Technion – Israel Institute of Technology',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5080469156',
      //             raw_author_name: 'Charlotte Vogt',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technion – Israel Institute of Technology'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-7383-9016',
      //             countries: ['NL'],
      //             last_name: 'Xie',
      //             first_name: 'Jingxiu',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I169381384'],
      //                 raw_affiliation_string: 'University of Groningen',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5039559318',
      //             raw_author_name: 'Jingxiu Xie',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Groningen'],
      //           },
      //         ],
      //         created_date: '2025-04-13T10:23:48.294154Z',
      //       },
      //       created_date: '2025-04-13T10:37:43.782199Z',
      //       action_date: '2025-03-27T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183212,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378274,
      //         doi: '10.1101/2025.04.07.647563',
      //         hub: null,
      //         slug: 'age-dependent-mechanisms-of-cardiac-hypertrophy-regression-following-exercise-in-female-mice',
      //         title:
      //           'Age-Dependent Mechanisms of Cardiac Hypertrophy Regression Following Exercise in Female Mice',
      //         authors: [],
      //         journal: null,
      //         reviews: [
      //           {
      //             id: 6911,
      //             score: 3,
      //             author: {
      //               id: 1872339,
      //               user: {
      //                 id: 66531,
      //                 email: 'javier.ardebol@gmail.com',
      //                 last_name: 'Ardebol',
      //                 first_name: 'Javier',
      //                 is_verified: false,
      //               },
      //               headline: 'MD MBA',
      //               last_name: 'Ardebol',
      //               first_name: 'Javier',
      //               profile_image:
      //                 'https://lh3.googleusercontent.com/a/ACg8ocIeBAtihYfrn1_9Qqw74tvv-XsQzSVPhlCbqep36Dks4s_KR9I=s96-c',
      //             },
      //           },
      //           {
      //             id: 6939,
      //             score: 3,
      //             author: {
      //               id: 7671544,
      //               user: {
      //                 id: 115178,
      //                 email: 'ltwritinghelp@gmail.com',
      //                 last_name: 'LT',
      //                 first_name: 'John',
      //                 is_verified: false,
      //               },
      //               headline: 'social worker and older adult caregiver',
      //               last_name: 'LT',
      //               first_name: 'John',
      //               profile_image:
      //                 'https://lh3.googleusercontent.com/a/ACg8ocI8Xp4nboBb662HYC_X1vohs5ryhcjC_sW85R8MwAKhtzAyGw=s96-c',
      //             },
      //           },
      //         ],
      //         abstract:
      //           'Cardiac adaptation to exercise is a fundamental physiological process, but its regression and the underlying molecular mechanisms, particularly in relation to age, remain poorly understood. This study investigated the age-dependent differences in cardiac remodeling and molecular signaling during exercise training and detraining in young (5-week-old) and adult (24-week-old) female mice, focusing specifically on how cardiac plasticity changes with adulthood rather than senescence. While both age groups exhibited significant cardiac hypertrophy after the exercise period, young mice displayed significantly more hypertrophic growth (23% increase in left ventricular mass versus 15% in adults). During detraining, cardiac mass regression occurred more rapidly in young mice. Transcriptomic analysis revealed distinct gene expression profiles between age groups, with changes in metabolic and autophagy pathways. Notably, ERK1/2 phosphorylation increased significantly during exercise in young but not adult hearts, correlating with elevated expression of well-known genes associated with exercise, namely CITED4 and SOD2. Furthermore, increased LC3-II/LC3-I ratio and AMPK phosphorylation were observed exclusively in young mice during detraining, indicating age-specific activation of autophagy-mediated cardiac remodeling. These findings demonstrate that cardiac adaptability to exercise and detraining follows distinct molecular pathways in young versus adult mice, with the younger heart exhibiting greater plasticity through enhanced ERK signaling during hypertrophy and autophagy during regression. This age-dependent cardiac plasticity may have important implications for understanding the cardiovascular benefits of exercise across the lifespan and developing age-appropriate exercise recommendations.',
      //         bounties: [
      //           {
      //             id: 4290,
      //             hub: null,
      //             amount: '540.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4290,
      //                 amount: 540,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-27T19:29:33.668518Z',
      //           },
      //         ],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Leinwand',
      //             first_name: 'Leslie A.',
      //           },
      //           {
      //             last_name: 'Crocini',
      //             first_name: 'Claudia',
      //           },
      //         ],
      //         created_date: '2025-04-12T17:43:12.918019Z',
      //       },
      //       created_date: '2025-04-12T18:11:17.148653Z',
      //       action_date: '2025-04-11T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 8,
      //         replies: 4,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 3,
      //           count: 2,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183160,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378272,
      //         doi: '10.1101/2025.03.30.646225',
      //         hub: {
      //           name: 'Biomedical Engineering',
      //           slug: 'biomedical-engineering',
      //         },
      //         slug: 'embolization-on-a-chip-novel-vascularized-liver-tumor-model-for-evaluation-of-cellular-and-cytokine-response-to-embolic-agents',
      //         title:
      //           'Embolization-on-a-chip: Novel Vascularized Liver Tumor Model for Evaluation of Cellular and Cytokine Response to Embolic Agents',
      //         authors: [
      //           {
      //             id: 1022948,
      //             user: null,
      //             headline: null,
      //             last_name: 'Khademhosseini',
      //             first_name: 'Ali',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1152704,
      //             user: null,
      //             headline: null,
      //             last_name: 'Mandal',
      //             first_name: 'Kalpana',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1363664,
      //             user: null,
      //             headline: null,
      //             last_name: 'Nguyen',
      //             first_name: 'Huu',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1999351,
      //             user: null,
      //             headline: null,
      //             last_name: 'Falcone',
      //             first_name: 'Natashya',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1999357,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ermis',
      //             first_name: 'Menekşe',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1999358,
      //             user: null,
      //             headline: null,
      //             last_name: 'Barros',
      //             first_name: 'Natan',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2289635,
      //             user: null,
      //             headline: null,
      //             last_name: 'Herculano',
      //             first_name: 'Rondinelli',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3352032,
      //             user: null,
      //             headline: null,
      //             last_name: 'Maity',
      //             first_name: 'Surjendu',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3574320,
      //             user: null,
      //             headline: null,
      //             last_name: 'Kawakita',
      //             first_name: 'Satoru',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3973415,
      //             user: null,
      //             headline: null,
      //             last_name: 'Khorsandi',
      //             first_name: 'Danial',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3973416,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jucaud',
      //             first_name: 'Vadim',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5880379,
      //             user: null,
      //             headline: null,
      //             last_name: 'Najafabadi',
      //             first_name: 'Alireza',
      //             profile_image: null,
      //           },
      //           {
      //             id: 6110996,
      //             user: null,
      //             headline: null,
      //             last_name: 'Tirpáková',
      //             first_name: 'Zuzana',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7070664,
      //             user: null,
      //             headline: null,
      //             last_name: 'Rashad',
      //             first_name: 'Ahmad',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7558116,
      //             user: null,
      //             headline: null,
      //             last_name: 'Peirsman',
      //             first_name: 'Arne',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730265,
      //             user: null,
      //             headline: null,
      //             last_name: 'Farhadi',
      //             first_name: 'Neda',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 89030,
      //           name: 'bioRxiv',
      //           slug: 'biorxiv-1',
      //           image: null,
      //           description:
      //             'provides preprints in biological sciences, including subfields like neuroscience, genomics, and physiology, operated by Cold Spring Harbor Laboratory',
      //         },
      //         reviews: [
      //           {
      //             id: 6934,
      //             score: 3,
      //             author: {
      //               id: 1872339,
      //               user: {
      //                 id: 66531,
      //                 email: 'javier.ardebol@gmail.com',
      //                 last_name: 'Ardebol',
      //                 first_name: 'Javier',
      //                 is_verified: false,
      //               },
      //               headline: 'MD MBA',
      //               last_name: 'Ardebol',
      //               first_name: 'Javier',
      //               profile_image:
      //                 'https://lh3.googleusercontent.com/a/ACg8ocIeBAtihYfrn1_9Qqw74tvv-XsQzSVPhlCbqep36Dks4s_KR9I=s96-c',
      //             },
      //           },
      //         ],
      //         abstract:
      //           'ABSTRACT Background Embolization is a well-established treatment modality for liver cancer. However, traditional embolization agents are limited by inefficient delivery and aggregation in blood vessels. Novel shear-thinning hydrogels (STH) have been developed to address the need for safer and more effective local delivery of embolic agents and therapeutics. Objective We aim to evaluate the efficacy of novel embolic agents such as STH using a human-relevant in vitro model that recapitulates human hepatocellular carcinoma capillary networks. Methods A vascularized human liver-tumor-on-a-chip model was developed to assess embolic agent performance. The effects of drug-eluting STH (DESTH) on tumor cell viability, surface marker expression, vasculature morphology, and cytokine responses were evaluated. To study the effects of embolization on microvasculature morphology independent of the chemotherapy compound, we assessed the effect of different drug-free embolic agents on the vascular tumor microenvironment under flow conditions. Results DESTH treatment induced tumor cell death, downregulated the expression of Epithelial Cell Adhesion Molecules (EpCAM) in HepG2, increased levels of cytokines such as Interleukin-4 (IL-4), Granulocyte-macrophage colony-stimulating factor (GM-CSF), and Vascular Endothelial Growth Factor (VEGF), and decreased albumin secretion. Furthermore, different embolic agents exert distinct effects on microvascular morphology, with STH causing complete regression of the microvascular networks. Conclusion This vascularized liver tumor-on-a-chip model enables human-relevant, real-time assessment of embolic agent efficacy and vascular response, paving the way for the development of innovative and effective embolization therapies for liver cancer.',
      //         bounties: [
      //           {
      //             id: 4287,
      //             hub: {
      //               name: 'Biomedical Engineering',
      //               slug: 'biomedical-engineering',
      //             },
      //             amount: '530.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4287,
      //                 amount: 530,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-27T10:46:50.769230Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0001-6130-2828',
      //             countries: [],
      //             last_name: 'Nguyen',
      //             first_name: 'Huu',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5045875574',
      //             raw_author_name: 'Huu Tuan Nguyen',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-1203-6815',
      //             countries: [],
      //             last_name: 'Tirpáková',
      //             first_name: 'Zuzana',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5065475607',
      //             raw_author_name: 'Zuzana Tirpakova',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-6519-8367',
      //             countries: [],
      //             last_name: 'Peirsman',
      //             first_name: 'Arne',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5084687240',
      //             raw_author_name: 'Arne Peirsman',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-0190-248X',
      //             countries: [],
      //             last_name: 'Maity',
      //             first_name: 'Surjendu',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5046749336',
      //             raw_author_name: 'Surjendu Maity',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-9791-0745',
      //             countries: [],
      //             last_name: 'Falcone',
      //             first_name: 'Natashya',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5018506460',
      //             raw_author_name: 'Natashya Falcone',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-3781-5786',
      //             countries: [],
      //             last_name: 'Kawakita',
      //             first_name: 'Satoru',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5065379521',
      //             raw_author_name: 'Satoru Kawakita',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-5245-5555',
      //             countries: [],
      //             last_name: 'Khorsandi',
      //             first_name: 'Danial',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5006763901',
      //             raw_author_name: 'Danial Khorsandi',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Rashad',
      //             first_name: 'Ahmad',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5108142672',
      //             raw_author_name: 'Ahmad Rashad',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-5276-1472',
      //             countries: [],
      //             last_name: 'Farhadi',
      //             first_name: 'Neda',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5055035143',
      //             raw_author_name: 'Neda Farhadi',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-4386-0997',
      //             countries: [],
      //             last_name: 'Mandal',
      //             first_name: 'Kalpana',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5054140350',
      //             raw_author_name: 'Kalpana Mandal',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2108-9812',
      //             countries: [],
      //             last_name: 'Ermis',
      //             first_name: 'Menekşe',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5064182804',
      //             raw_author_name: 'Menekse Ermis',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-7236-0847',
      //             countries: [],
      //             last_name: 'Herculano',
      //             first_name: 'Rondinelli',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5014979148',
      //             raw_author_name: 'Rondinelli Donizetti Herculano',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-8215-4374',
      //             countries: [],
      //             last_name: 'Najafabadi',
      //             first_name: 'Alireza',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5007244623',
      //             raw_author_name: 'Alireza Hassani Najafabadi',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-4386-0997',
      //             countries: [],
      //             last_name: 'Mandal',
      //             first_name: 'Kalpana',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5054140350',
      //             raw_author_name: 'Mehmet Remzi Dokmeci',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-8689-4110',
      //             countries: [],
      //             last_name: 'Barros',
      //             first_name: 'Natan',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5091643895',
      //             raw_author_name: 'Natan Roberto De Barros',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2692-1524',
      //             countries: [],
      //             last_name: 'Khademhosseini',
      //             first_name: 'Ali',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5033056518',
      //             raw_author_name: 'Ali Khademhosseini',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-0385-2623',
      //             countries: [],
      //             last_name: 'Jucaud',
      //             first_name: 'Vadim',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5046486757',
      //             raw_author_name: 'Vadim Jucaud',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //         ],
      //         created_date: '2025-04-12T17:31:00.194509Z',
      //       },
      //       created_date: '2025-04-12T17:31:01.573443Z',
      //       action_date: '2025-04-04T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 7,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 3,
      //           count: 1,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183569,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378295,
      //         doi: '10.20944/preprints202504.0791.v1',
      //         hub: {
      //           name: 'Control And Systems Engineering',
      //           slug: 'control-and-systems-engineering',
      //         },
      //         slug: 'improving-the-distillation-efficiency-of-essential-oils-by-re-water-and-steam-distillation-application-of-500-liters-prototype-distillation-machine-and-different-raw-material-packing-grids',
      //         title:
      //           'Improving the Distillation Efficiency of Essential Oils by Re-Water and Steam Distillation (Application of 500 Liters Prototype Distillation Machine and Different Raw Material Packing Grids)',
      //         authors: [
      //           {
      //             id: 2037477,
      //             user: null,
      //             headline: null,
      //             last_name: 'Li',
      //             first_name: 'Yongliang',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7265539,
      //             user: null,
      //             headline: null,
      //             last_name: 'Parametthanuwat',
      //             first_name: 'Thanya',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7265540,
      //             user: null,
      //             headline: null,
      //             last_name: 'Bhuwakietkumjohn',
      //             first_name: 'Nipon',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7265541,
      //             user: null,
      //             headline: null,
      //             last_name: 'Sichamnan',
      //             first_name: 'Surachet',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730287,
      //             user: null,
      //             headline: null,
      //             last_name: 'Pipatpaiboon',
      //             first_name: 'Namphon',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730288,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ding',
      //             first_name: 'Yulong',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'This research presents an improvement in the efficiency of essential oils (EO) distillation using a new distillation method called recurrent water and steam distillation (RWASD) used during testing with a 500-liter prototype essential oils distillation machine (500 L PDM). The raw material used was 100 kg of limes. In each distillation cycle, the test was compared with water and steam distillation (WASD) and tested with different raw material grid configurations. It was found that the distillation using the RWASD method increased the amount of EO from limes by 53.69% or 43.21 ml compared to WASD. The results of Gas Chromatography-Mass Spectrometry (GC-MS) analysis of bioactive compounds from the distilled EO found that the important compounds were still present in amounts close to the standards obtained from many research studies, namely β-Myrcene (2.72%), Limonene (20.72%), α-Phellandrene (1.27%), and Terpinen-4-ol (3.04%). In addition, it was found that the temperature, state of saturated steam, and heat distribution during the distillation were quite constant in both state and properties. Results showed the heat loss value including the design and construction error value of 500 L PDM were 8.41% and 4.66% respectively, leading to the use of the percentage of useful heat energy that stabilized at 29,880 kJ/s and 22.47% respectively. Additionally, the shape of the grid containing the raw material affects the heat temperature distribution and the amount of EO distilled at 10.14% and 8.07% for the value used with the normal grid (NS), resulting in the efficiency of exergy at 49.97% and the highest values found from exergy in, exergy out, and exergy loss at 294.29, 144.76, and 150.22 kJ/s respectively. The results from this test can be further developed and expanded to application in the SMEs industry, including serving as basic information for the development related to the EO distillation industry.',
      //         bounties: [
      //           {
      //             id: 4303,
      //             hub: {
      //               name: 'Control And Systems Engineering',
      //               slug: 'control-and-systems-engineering',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4303,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:40:17.788732Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             sequence: 'first',
      //             last_name: 'Pipatpaiboon',
      //             first_name: 'Namphon',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Parametthanuwat',
      //             first_name: 'Thanya',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Bhuwakietkumjohn',
      //             first_name: 'Nipon',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Ding',
      //             first_name: 'Yulong',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Li',
      //             first_name: 'Yongliang',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Sichamnan',
      //             first_name: 'Surachet',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:45:25.015721Z',
      //       },
      //       created_date: '2025-04-12T18:45:37.116620Z',
      //       action_date: '2025-04-09T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183540,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378294,
      //         doi: '10.20944/preprints202503.1149.v1',
      //         hub: {
      //           name: 'Mechanical Engineering',
      //           slug: 'mechanical-engineering',
      //         },
      //         slug: 'design-of-copolymer-reinforced-composite-material-for-leaf-springs-inside-elastic-suspension-system-of-light-duty-trucks',
      //         title:
      //           'Design of Copolymer-Reinforced Composite Material for Leaf Springs Inside Elastic Suspension System of Light-Duty Trucks',
      //         authors: [
      //           {
      //             id: 4286367,
      //             user: null,
      //             headline: null,
      //             last_name: 'Stojаnović',
      //             first_name: 'Blaža',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5001553,
      //             user: null,
      //             headline: null,
      //             last_name: 'Savić',
      //             first_name: 'Slobodan',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7161581,
      //             user: null,
      //             headline: null,
      //             last_name: 'Radojković',
      //             first_name: 'Mladen',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7701769,
      //             user: null,
      //             headline: null,
      //             last_name: 'Kader',
      //             first_name: 'Ekhlas',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730285,
      //             user: null,
      //             headline: null,
      //             last_name: 'Abed',
      //             first_name: 'Al-Hussein',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730286,
      //             user: null,
      //             headline: null,
      //             last_name: 'Milojević',
      //             first_name: 'Saša',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'The growing request regarding the comfort of passengers, saving the environment by using new materials to lower fuel consumption, as well as exhaust emissions of motor vehicles, is the main cause of searching for new and high-performance products in this area. Composite materials are the most promising technology. The composite leaf springs, applying as part of the elastic suspension system with high strength, load-carrying capacity, and lightweight, are one of the possible manners to achieve those goals inside of vehicles used for the carriage of goods. As an example, inside the manuscript, fabricated epoxy thermoset is blended with 10-50 wt.% of polysulfide rubber composites and reinforced with 10 wt.% of alumina powder. The characteristics of the copolymer composite blend were studied by performing ASTM mechanical tests, including tensile strength, impact strength, hardness, and damping ratio tests. Experimental test results showed that tensile strength, natural frequency, and damped ratio were decreased when the polysulfide rubber percent increase in contrast to tensile strength, which showed a noticeable decrement. From the second side, the reinforcement on the basis of alumina powder caused a weighty increase in tensile strength and natural frequency with a good improvement in deformation strength. Impact strength and damping ratio were maximized when alumina powder was added increasingly, while this increase was contrary to, causing a decrease in the hardness of reinforcement. The experimental results were optimized using the statistical methods. Design of the experiment and linear regression model used to select the most appropriate mixture inside the proposed composite material for leaf springs manufacturing. Finally, validation of the model was realized by application of the statistical method of analysis of variance and probability plots (normal distribution). The regression equations of tensile and impact strength, hardness, and damping ratio test results showed that the proposed composite material is suitable to be applied for manufacturing the leaf springs considering loadings and working conditions during exploitation of such vehicles in traffic. Finite element analysis on the basis of a finite element model of composite material was performed using SolidWorks Simulation 22. Mechanical software ANSYS 2022 R1 was used to study the mechanical properties of the leaf spring model fabricated of the proposed composite material. Finite element analysis results interpreted and showed significant reduction in leaf spring weight with very good mechanical properties considering tensile and impact strength, hardness, and damping ratio when using the proposed copolymer-reinforced composite material.',
      //         bounties: [
      //           {
      //             id: 4314,
      //             hub: {
      //               name: 'Mechanical Engineering',
      //               slug: 'mechanical-engineering',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4314,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:41:05.566627Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             ORCID: 'https://orcid.org/0000-0001-5995-6910',
      //             sequence: 'first',
      //             last_name: 'Kader',
      //             first_name: 'Ekhlas Edan',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Abed',
      //             first_name: 'Akram Mahde',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Radojković',
      //             first_name: 'Mladen',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Savić',
      //             first_name: 'Slobodan',
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-0569-047X',
      //             sequence: 'additional',
      //             last_name: 'Milojević',
      //             first_name: 'Saša',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-4790-2856',
      //             sequence: 'additional',
      //             last_name: 'Stojanović',
      //             first_name: 'Blaža',
      //             'authenticated-orcid': false,
      //           },
      //         ],
      //         created_date: '2025-04-12T18:43:40.542202Z',
      //       },
      //       created_date: '2025-04-12T18:44:23.158195Z',
      //       action_date: '2025-03-17T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183509,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378293,
      //         doi: '10.20944/preprints202503.1855.v1',
      //         hub: {
      //           name: 'Hardware And Architecture',
      //           slug: 'hardware-and-architecture',
      //         },
      //         slug: 'ml-driven-memory-management-unit-mmu-in-fpga-architectures',
      //         title: 'ML-Driven Memory Management Unit (MMU) in FPGA Architectures',
      //         authors: [
      //           {
      //             id: 5486432,
      //             user: null,
      //             headline: null,
      //             last_name: 'Parikh',
      //             first_name: 'Kejal',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730284,
      //             user: null,
      //             headline: null,
      //             last_name: 'Parikh',
      //             first_name: 'Raj',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'FPGAs are becoming more popular for general-purpose computing, and AI/ML acceleration, but memory management on these reconfigurable hardware elements is still a challenge compared to fixed-logic architectures. We present a new, Machine Learning-driven Memory Management Unit (MMU) architecture for FPGAs, which employs intelligent algorithms (e.g., reinforcement learning and LSTM neural networks) to optimize memory response. In this work, we describe an ML-augmented MMU\'s architectural design and algorithmic framework, including virtual memory support, adaptive caching/prefetching, and dynamic allocation. Further showcasing latency, throughput, energy efficiency, and memory bandwidth benefits. We also show how we improve security mechanisms, relying on cache timing side-channels and speculative execution vulnerabilities, for cryptographic and ML algorithms. The design is adaptable across various applications (AI inference, high-performance computing, general workloads) and FPGA platforms. Finally, we describe the novelty when applied to a patent context with broad claims on machine learning applied to hardware memory management and security integration. This work is derived from the Provisional Patent Application #63/775,213, entitled "ML-Driven Memory Management Unit (MMU) in FPGA Architectures," filed on Mar 20, 2025, by Raj Sandip Parikh, with the United States Patent and Trademark Office (USPTO).',
      //         bounties: [
      //           {
      //             id: 4313,
      //             hub: {
      //               name: 'Hardware And Architecture',
      //               slug: 'hardware-and-architecture',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4313,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:41:03.966260Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             ORCID: 'https://orcid.org/0009-0004-1467-8055',
      //             sequence: 'first',
      //             last_name: 'Parikh',
      //             first_name: 'Raj',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Parikh',
      //             first_name: 'Khushi',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:42:58.158041Z',
      //       },
      //       created_date: '2025-04-12T18:43:12.629465Z',
      //       action_date: '2025-03-25T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183486,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378292,
      //         doi: '10.20944/preprints202504.0258.v1',
      //         hub: {
      //           name: 'Pollution',
      //           slug: 'pollution-1',
      //         },
      //         slug: 'the-potential-of-utility-scale-hybrid-wind-solar-pv-power-plants-deployment-from-data-to-results-a-simplified-application-for-the-spanish-potential',
      //         title:
      //           'The Potential of Utility-Scale Hybrid Wind – Solar PV Power Plants Deployment: From Data to Results. A Simplified Application for the Spanish Potential',
      //         authors: [
      //           {
      //             id: 1806625,
      //             user: null,
      //             headline: null,
      //             last_name: 'Borsato',
      //             first_name: 'Martino',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1996062,
      //             user: null,
      //             headline: null,
      //             last_name: 'García‐Bustamante',
      //             first_name: 'Elena',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2221045,
      //             user: null,
      //             headline: null,
      //             last_name: 'Domínguez',
      //             first_name: 'Javier',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2221047,
      //             user: null,
      //             headline: null,
      //             last_name: 'Arribas',
      //             first_name: 'Luis',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2221050,
      //             user: null,
      //             headline: null,
      //             last_name: 'Martín',
      //             first_name: 'Ana',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4107490,
      //             user: null,
      //             headline: null,
      //             last_name: 'Navarro',
      //             first_name: 'Jorge',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5468323,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zarzalejo',
      //             first_name: 'Luis',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730283,
      //             user: null,
      //             headline: null,
      //             last_name: 'Cruz',
      //             first_name: 'Ivan',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'The deployment of utility-scale hybrid wind-solar PV power plants is gaining global attention due to their enhanced performance in power systems with high renewable energy penetration. To assess their potential, accurate estimations must be derived from available data, addressing key challenges such as: (1) spatial and temporal resolution requirements, particularly for renewable resource characterization; (2) energy balances aligned with various business models; (3) regulatory constraints (environmental, technical, etc.); and (4) cost dependencies of different components and system characteristics. When conducting such analyses at regional or national scales, a trade-off must be achieved to balance accuracy with computational efficiency. This study reviews existing experiences in hybrid plant deployment, with a focus on Spain, and proposes a simplified methodology for country-level analysis.',
      //         bounties: [
      //           {
      //             id: 4312,
      //             hub: {
      //               name: 'Pollution',
      //               slug: 'pollution-1',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4312,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:41:02.497234Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-1418-2138',
      //             sequence: 'first',
      //             last_name: 'Arribas',
      //             first_name: 'Luis',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-9677-7265',
      //             sequence: 'additional',
      //             last_name: 'Domínguez',
      //             first_name: 'Javier',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Borsato',
      //             first_name: 'Michael',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Martín',
      //             first_name: 'Ana M.',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Navarro',
      //             first_name: 'Jorge',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Bustamante',
      //             first_name: 'Elena García',
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-4522-6815',
      //             sequence: 'additional',
      //             last_name: 'Zarzalejo',
      //             first_name: 'Luis F.',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-1052-7442',
      //             sequence: 'additional',
      //             last_name: 'Cruz',
      //             first_name: 'Ignacio',
      //             'authenticated-orcid': false,
      //           },
      //         ],
      //         created_date: '2025-04-12T18:39:13.196828Z',
      //       },
      //       created_date: '2025-04-12T18:39:30.804653Z',
      //       action_date: '2025-04-03T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183453,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378291,
      //         doi: '10.20944/preprints202504.0678.v1',
      //         hub: {
      //           name: 'Instrumentation',
      //           slug: 'instrumentation-1',
      //         },
      //         slug: 'a-novel-head-mounted-time-of-flight-sensor-array-for-the-visually-impaired-to-enhance-real-time-spatial-awareness',
      //         title:
      //           'A Novel Head-Mounted Time-of-Flight Sensor Array for the Visually Impaired to Enhance Real-Time Spatial Awareness',
      //         authors: [
      //           {
      //             id: 1505428,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ma',
      //             first_name: 'Renfei',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2033131,
      //             user: null,
      //             headline: null,
      //             last_name: 'Parisi',
      //             first_name: 'Luca',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730281,
      //             user: null,
      //             headline: null,
      //             last_name: 'Maraashli',
      //             first_name: 'Malek',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730282,
      //             user: null,
      //             headline: null,
      //             last_name: 'Youseffi',
      //             first_name: 'Mansour',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'A novel head-mounted assistive device was designed, developed, and validated to enhance spatial awareness for individuals with visual impairments by integrating Time-of-Flight (ToF) sensors and haptic feedback. The device leverages three VL53L1X ToF sensors arranged at constant angular offsets to provide a forward-facing with field of view of about 81&amp;deg;, enabling to detect obstacles approaching from any directions. Each sensor is mapped to a dedicated coin vibration motor, positioned in alignment with the person&amp;rsquo;s head to deliver directional tactile feedback. The Arduino Pro Mini microcontroller acquires the distance measurements through the I&amp;sup2;C protocol and generates pulse-width modulated (PWM) signals to modulate vibration strength based on the obstacle proximity. This mapping lets the user perceive each area and relative distance of objects nearby without relying on vision or auditory comments. The device was assessed under indoor conditions using fixed-distance trials from 150 cm down to 15 cm in 15 cm increments. Results show a dependable detection, within this range, with dimension deviations maintained within &amp;plusmn;1 cm. Power draw was measured at around 495 mA throughout non-stop operation, and a runtime with a 1000 mAh lithium-polymer battery validated operational intervals of 2.6 to five hours, relying on motor usage frequency. The overall tool design prioritises compactness, comfort, and real-time responsiveness, imparting a low-cost and non-intrusive solution for improving mobility and environmental consciousness among visually-impaired users in indoor environments.',
      //         bounties: [
      //           {
      //             id: 4311,
      //             hub: {
      //               name: 'Instrumentation',
      //               slug: 'instrumentation-1',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4311,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:41:01.415218Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             sequence: 'first',
      //             last_name: 'Al Maraashli',
      //             first_name: 'Malek',
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-4639-1313',
      //             sequence: 'additional',
      //             last_name: 'Youseffi',
      //             first_name: 'Mansour',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-2495-4787',
      //             sequence: 'additional',
      //             last_name: 'Ma',
      //             first_name: 'Renfei',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-5865-8708',
      //             sequence: 'additional',
      //             last_name: 'Parisi',
      //             first_name: 'Luca',
      //             'authenticated-orcid': false,
      //           },
      //         ],
      //         created_date: '2025-04-12T18:38:45.574272Z',
      //       },
      //       created_date: '2025-04-12T18:38:59.522212Z',
      //       action_date: '2025-04-09T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183420,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378290,
      //         doi: '10.20944/preprints202503.2062.v1',
      //         hub: {
      //           name: 'Aerospace Engineering',
      //           slug: 'aerospace-engineering',
      //         },
      //         slug: 'proof-of-concept-of-a-monopulse-antenna-architecture-enabling-radar-sensors-in-unmanned-aircraft-collision-avoidance-systems-for-uas-in-u-space-airspaces',
      //         title:
      //           'Proof-of-Concept of a Monopulse Antenna Architecture Enabling Radar Sensors in Unmanned Aircraft Collision Avoidance Systems for UAS in U-Space Airspaces',
      //         authors: [
      //           {
      //             id: 4420182,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ferrando‐Bataller',
      //             first_name: 'Miguel',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730279,
      //             user: null,
      //             headline: null,
      //             last_name: 'Alapont',
      //             first_name: 'Javier',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730280,
      //             user: null,
      //             headline: null,
      //             last_name: 'Tejedor',
      //             first_name: 'Juan',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'In this paper, we propose and proof an innovative concept of radar antennas suited for Collision Avoidance (CA) systems installed on board small Unmanned Aircraft (UA). The proposed architecture provides 360º monopulse coverage around the host platform enabling the detection and accurate position estimation of airborne, non-cooperative hazards using lightweight, low-profile antennas. These antennas can be manufactured using low-cost 3D printing techniques and are easily integrable in the UAs airframe without degrading their airworthiness. In the paper, we sketch a Detect and Avoid (DAA) concept of operations (ConOps) built on the ConOps for separation management developed by the SESAR 2020 project BUBBLES in line with the SESAR U-space ConOps Ed. 4. In that ConOps, Remain Well Clear (RWC) and Collision Avoidance functions are provided separately (namely, the responsibility for providing the RWC function lies with ground-based U-space services whereas the CA function is considered an airborne safety net provided by on-board equipment). From the ConOps, we define operation-centric design requirements and describe the proposed architecture. We prove the concept by a combination of simulations and measurements in anechoic chamber using a prototype at 24 GHz.',
      //         bounties: [
      //           {
      //             id: 4310,
      //             hub: {
      //               name: 'Aerospace Engineering',
      //               slug: 'aerospace-engineering',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4310,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:40:59.463001Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             sequence: 'first',
      //             last_name: 'Ruiz Alapont',
      //             first_name: 'Javier',
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-3561-5112',
      //             sequence: 'additional',
      //             last_name: 'Ferrando-Bataller',
      //             first_name: 'Miguel',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Balbastre Tejedor',
      //             first_name: 'Juan Vicente',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:34:58.339176Z',
      //       },
      //       created_date: '2025-04-12T18:37:14.303583Z',
      //       action_date: '2025-03-27T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183332,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378289,
      //         doi: '10.20944/preprints202503.1622.v1',
      //         hub: {
      //           name: 'Biomedical Engineering',
      //           slug: 'biomedical-engineering',
      //         },
      //         slug: 'roboct-the-state-and-current-challenges-of-industrial-twin-robotic-ct-systems',
      //         title:
      //           'RoboCT: The State and current Challenges of industrial Twin Robotic CT Systems',
      //         authors: [
      //           {
      //             id: 1432048,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jung',
      //             first_name: 'Alexander',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4324329,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zabler',
      //             first_name: 'Simon',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730273,
      //             user: null,
      //             headline: null,
      //             last_name: 'Herl',
      //             first_name: 'Gabriel',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730274,
      //             user: null,
      //             headline: null,
      //             last_name: 'Wittl',
      //             first_name: 'Simon',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730275,
      //             user: null,
      //             headline: null,
      //             last_name: 'Handke',
      //             first_name: 'Niklas',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730276,
      //             user: null,
      //             headline: null,
      //             last_name: 'Weiss',
      //             first_name: 'Anton',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730277,
      //             user: null,
      //             headline: null,
      //             last_name: 'Eberhorn',
      //             first_name: 'Markus',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730278,
      //             user: null,
      //             headline: null,
      //             last_name: 'Oeckl',
      //             first_name: 'Steven',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'Twin robotic X-ray computed tomography (CT) systems enable flexible CT scans by using robots to move the X-ray source and the X-ray detector around an object&amp;rsquo;s region of interest. This allows scans of large objects, image quality optimization and scan time reduction. Despite these advantages, robotic CT systems still face challenges that limit their widespread adoption. This paper discusses the state of twin robotic CT and its current main challenges. These challenges include optimization of scanning trajectories, precise geometric calibration and advanced 3D reconstruction techniques.',
      //         bounties: [
      //           {
      //             id: 4309,
      //             hub: {
      //               name: 'Biomedical Engineering',
      //               slug: 'biomedical-engineering',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4309,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:40:56.882167Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             sequence: 'first',
      //             last_name: 'Herl',
      //             first_name: 'Gabriel',
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0009-0006-0365-7018',
      //             sequence: 'additional',
      //             last_name: 'Wittl',
      //             first_name: 'Simon',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Jung',
      //             first_name: 'Alexander',
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0009-0008-7494-1395',
      //             sequence: 'additional',
      //             last_name: 'Handke',
      //             first_name: 'Niklas',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Weiss',
      //             first_name: 'Anton',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Eberhorn',
      //             first_name: 'Markus',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Oeckl',
      //             first_name: 'Steven',
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Zabler',
      //             first_name: 'Simon',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:32:30.838844Z',
      //       },
      //       created_date: '2025-04-12T18:34:43.586327Z',
      //       action_date: '2025-03-24T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183293,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378287,
      //         doi: '10.20944/preprints202503.1400.v1',
      //         hub: {
      //           name: 'Automotive Engineering',
      //           slug: 'automotive-engineering',
      //         },
      //         slug: 'a-novel-approach-for-modelling-and-developing-virtual-sensors-utilized-in-the-simulation-of-an-autonomous-vehicle',
      //         title:
      //           'A Novel Approach for Modelling and Developing Virtual Sensors Utilized in the Simulation of an Autonomous Vehicle',
      //         authors: [
      //           {
      //             id: 6531280,
      //             user: null,
      //             headline: null,
      //             last_name: 'Iclodean',
      //             first_name: 'Călin',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730267,
      //             user: null,
      //             headline: null,
      //             last_name: 'Barabás',
      //             first_name: 'István',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730268,
      //             user: null,
      //             headline: null,
      //             last_name: 'Beleș',
      //             first_name: 'Horia',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730269,
      //             user: null,
      //             headline: null,
      //             last_name: 'Antonya',
      //             first_name: 'Csaba',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730270,
      //             user: null,
      //             headline: null,
      //             last_name: 'Molea',
      //             first_name: 'Andreia',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7730271,
      //             user: null,
      //             headline: null,
      //             last_name: 'Scurt',
      //             first_name: 'Florin',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 582905,
      //           name: 'MDPI AG',
      //           slug: 'mdpi-ag',
      //           image: null,
      //           description: '',
      //         },
      //         reviews: [],
      //         abstract:
      //           'A virtual model enables the study of reality in a virtual environment using a theoretical model, which is a digital image of a real model. The complexity of the virtual model must correspond to the reality of the evaluated system, becoming as complex as necessary nevertheless as simple as possible, allowing for computer simulation results to be vali-dated by experimental measurements. The virtual model of the autonomous vehicle was created using the CarMaker software package, which was developed by the IPG Auto-motive company and is extensively used in both the international academic community and the automotive industry. The virtual model simulates the real-time operation of a vehicle&amp;#039;s elementary systems at the system level and provides an open platform for the development of virtual test scenarios in the Autonomous Vehicles, ADAS, Powertrain, and Vehicle Dynamics application areas. This model included the following virtual sen-sors: slip angle sensor, inertial sensor, object sensor, free space sensor, traffic sign sensor, line sensor, road sensor, object by line sensor, camera sensor, global navigation sensor, radar sensor, lidar sensor and ultrasonic sensor. Virtual sensors can be classified based on how they generate responses: sensors that operate on parameters derived from measurement characteristics, sensors that operate on developed modeling methods, and sensors that operate on applications.',
      //         bounties: [
      //           {
      //             id: 4308,
      //             hub: {
      //               name: 'Automotive Engineering',
      //               slug: 'automotive-engineering',
      //             },
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4308,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:40:52.604125Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-2194-7036',
      //             sequence: 'first',
      //             last_name: 'Barabás',
      //             first_name: 'István',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-1347-2341',
      //             sequence: 'additional',
      //             last_name: 'Iclodean',
      //             first_name: 'Calin',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-1236-8438',
      //             sequence: 'additional',
      //             last_name: 'Beles',
      //             first_name: 'Horia',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0002-0139-5425',
      //             sequence: 'additional',
      //             last_name: 'Antonya',
      //             first_name: 'Csaba',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             ORCID: 'https://orcid.org/0000-0003-3848-2722',
      //             sequence: 'additional',
      //             last_name: 'Molea',
      //             first_name: 'Andreia',
      //             'authenticated-orcid': false,
      //           },
      //           {
      //             sequence: 'additional',
      //             last_name: 'Scurt',
      //             first_name: 'Florin Bogdan',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:31:20.920538Z',
      //       },
      //       created_date: '2025-04-12T18:31:34.351507Z',
      //       action_date: '2025-03-19T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183278,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378286,
      //         doi: '6y4divvG',
      //         hub: null,
      //         slug: 'diffusion-augmented-complex-maximum-total-correntropy-algorithm-for-power-system-frequency-estimation',
      //         title:
      //           'Diffusion Augmented Complex Maximum Total Correntropy Algorithm for Power System Frequency Estimation',
      //         authors: [],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           'Currently, adaptive filtering algorithms have been widely applied in frequency estimation for power systems. However, research on diffusion tasks remains insufficient. Existing diffusion adaptive frequency estimation algorithms exhibit certain limitations in handling input noise and lack robustness against impulsive noise. Moreover, traditional adaptive filtering algorithms designed based on the strictly-linear (SL) model fail to effectively address frequency estimation challenges in unbalanced three-phase power systems. To address these issues, this letter proposes an improved diffusion augmented complex maximum total correntropy (DAMTCC) algorithm based on the widely linear (WL) model. The proposed algorithm not only significantly enhances the capability to handle input noise but also demonstrates superior robustness to impulsive noise. Furthermore, it successfully resolves the critical challenge of frequency estimation in unbalanced three-phase power systems, offering an efficient and reliable solution for diffusion power system frequency estimation. Finally, we analyze the stability of the algorithm and computer simulations verify the excellent performance of the algorithm. ',
      //         bounties: [
      //           {
      //             id: 4307,
      //             hub: null,
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4307,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:40:48.914731Z',
      //           },
      //         ],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Zhao',
      //             first_name: 'Haiquan',
      //           },
      //           {
      //             last_name: 'Peng',
      //             first_name: 'Yi',
      //           },
      //           {
      //             last_name: 'Chen',
      //             first_name: 'Jinsong',
      //           },
      //           {
      //             last_name: 'Hu',
      //             first_name: 'Jinhui',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:28:45.153962Z',
      //       },
      //       created_date: '2025-04-12T18:28:59.232277Z',
      //       action_date: '2025-04-11T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 2183277,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9378285,
      //         doi: 'h69HD2AM',
      //         hub: null,
      //         slug: 'heart-failure-prediction-using-modal-decomposition-and-masked-autoencoders-for-scarce-echocardiography-databases',
      //         title:
      //           'Heart Failure Prediction using Modal Decomposition and Masked Autoencoders for Scarce Echocardiography Databases',
      //         authors: [],
      //         journal: null,
      //         reviews: [],
      //         abstract:
      //           'Heart diseases constitute the main cause of international human defunction. According to the World Health Organization (WHO), approximately 18 million deaths happen each year due to precisely heart diseases. In particular, heart failures (HF) press the healthcare industry to develop systems for their early, rapid and effective prediction. In this work, an automatic system which analyses in real-time echocardiography video sequences is proposed for the challenging and more specific task of prediction of heart failure times. This system is based on a novel deep learning framework, and works in two stages. The first one transforms the data included in a database of echocardiography video sequences into a machine learning-compatible collection of annotated images which can be used in the training phase of any kind of machine learning-based framework, including a deep learning one. This initial stage includes the use of the Higher Order Dynamic Mode Decomposition (HODMD) algorithm for both data augmentation and feature extraction. The second stage is focused on building and training a Vision Transformer (ViT). Self-supervised learning (SSL) methods, which have been so far barely explored in the literature about heart failure prediction, are applied to effectively train the ViT from scratch, even with scarce databases of echocardiograms. The designed neural network analyses images from echocardiography sequences to estimate the time in which a heart failure will happen. The results obtained show the efficacy of the HODMD algorithm and the superiority of the proposed system with respect to several established ViT and Convolutional Neural Network (CNN) architectures. ',
      //         bounties: [
      //           {
      //             id: 4306,
      //             hub: null,
      //             amount: '600.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4306,
      //                 amount: 600,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-28T21:40:47.101846Z',
      //           },
      //         ],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Bell-Navas',
      //             first_name: 'Andrés',
      //           },
      //           {
      //             last_name: 'Villalba-Orero',
      //             first_name: 'María',
      //           },
      //           {
      //             last_name: 'Lara-Pezzi',
      //             first_name: 'Enrique',
      //           },
      //           {
      //             last_name: 'Garicano-Mena',
      //             first_name: 'Jesús',
      //           },
      //           {
      //             last_name: 'Clainche',
      //             first_name: 'Soledad Le',
      //           },
      //         ],
      //         created_date: '2025-04-12T18:24:11.280367Z',
      //       },
      //       created_date: '2025-04-12T18:25:06.308738Z',
      //       action_date: '2025-04-11T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //   ],
      // };

      const transformedEntries = response.results
        .map((entry) => {
          try {
            return transformFeedEntry(entry as any);
          } catch (error) {
            console.error('Error transforming feed entry:', error, entry);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      // Return the transformed entries
      return {
        entries: transformedEntries,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      // Return empty entries on error
      return {
        entries: [],
        hasMore: false,
      };
    }
  }

  // Helper function to transform a raw bounty from the feed API to a Bounty object
  // This is used by the BountyCard component which expects the old Bounty type
  static transformRawBounty(rawBounty: RawApiFeedEntry): Bounty {
    if (!rawBounty) {
      throw new Error('Raw bounty is undefined');
    }

    const { content_object, author, action_date, created_date } = rawBounty;

    if (!content_object) {
      throw new Error('Raw bounty content_object is undefined');
    }

    // Create default author if missing
    const defaultAuthor = {
      id: 0,
      first_name: 'Unknown',
      last_name: 'User',
      profile_image: '',
      description: '',
      user: {
        id: 0,
        first_name: 'Unknown',
        last_name: 'User',
        email: '',
        is_verified: false,
      },
    };

    // Use default author if author is missing
    const safeAuthor = author || defaultAuthor;

    // Transform the author to a User object
    let user;
    try {
      if (safeAuthor.user) {
        user = transformUser(safeAuthor.user);
        user.authorProfile = transformAuthorProfile(safeAuthor);
      } else {
        user = transformUser({
          id: safeAuthor.id,
          email: '',
          first_name: safeAuthor.first_name,
          last_name: safeAuthor.last_name,
          is_verified: false,
          balance: 0,
          author_profile: safeAuthor,
        });
      }
    } catch (error) {
      console.error('Error transforming user:', error);
      // Fallback to manual transformation
      user = {
        id: safeAuthor.user?.id || safeAuthor.id || 0,
        email: safeAuthor.user?.email || '',
        firstName: safeAuthor.first_name || '',
        lastName: safeAuthor.last_name || '',
        fullName:
          `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
        isVerified: safeAuthor.user?.is_verified || false,
        balance: 0,
        authorProfile: {
          id: safeAuthor.id || 0,
          fullName:
            `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
          profileImage: safeAuthor.profile_image || '',
          headline: safeAuthor.description || '',
          profileUrl: `/profile/${safeAuthor.id || 0}`,
          user: {
            id: safeAuthor.user?.id || safeAuthor.id || 0,
            email: safeAuthor.user?.email || '',
            firstName: safeAuthor.first_name || '',
            lastName: safeAuthor.last_name || '',
            fullName:
              `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() ||
              'Unknown User',
            isVerified: safeAuthor.user?.is_verified || false,
            balance: 0,
          },
          isClaimed: !!safeAuthor.user,
        },
      };
    }

    // Map bounty_type to BountyType
    const bountyTypeMap: Record<string, BountyType> = {
      REVIEW: 'REVIEW',
      ANSWER: 'ANSWER',
      BOUNTY: 'BOUNTY',
      GENERIC_COMMENT: 'GENERIC_COMMENT',
    };

    // Get the bounty type, defaulting to 'BOUNTY' if not found
    const bountyType =
      content_object.bounty_type && bountyTypeMap[content_object.bounty_type]
        ? bountyTypeMap[content_object.bounty_type]
        : 'BOUNTY';

    // Create a Bounty object from the feed entry
    return {
      id: content_object.id,
      amount: (content_object.amount || 0).toString(),
      status: content_object.status || 'OPEN',
      expirationDate: content_object.expiration_date || new Date().toISOString(),
      bountyType,
      createdBy: user,
      solutions: [],
      contributions: [],
      totalAmount: (content_object.amount || 0).toString(),
      raw: {
        ...content_object,
        created_date: created_date || new Date().toISOString(),
        action_date: action_date || new Date().toISOString(),
        author: safeAuthor,
        hub: content_object.hub || { name: 'Unknown', slug: 'unknown' },
        paper: content_object.paper || null,
      },
    };
  }

  // Helper function to transform a raw fundraise from the feed API to a Fundraise object
  static transformRawFundraise(rawFundraise: RawApiFeedEntry): Fundraise {
    if (!rawFundraise) {
      throw new Error('Raw fundraise is undefined');
    }

    const { content_object } = rawFundraise;

    if (!content_object) {
      throw new Error('Raw fundraise content_object is undefined');
    }

    // Create a raw format expected by the transformer
    const formattedRawFundraise = {
      id: content_object.id,
      status: content_object.status,
      goal_currency: content_object.goal_currency,
      goal_amount: {
        usd: content_object.goal_amount?.usd || 0,
        rsc: content_object.goal_amount?.rsc || 0,
      },
      amount_raised: {
        usd: content_object.amount_raised?.usd || 0,
        rsc: content_object.amount_raised?.rsc || 0,
      },
      start_date: content_object.start_date,
      end_date: content_object.end_date,
      contributors: {
        total: content_object.contributors?.total || 0,
        top: (content_object.contributors?.top || []).map((contributor: any) => ({
          author_profile: contributor.author_profile,
        })),
      },
      created_date: content_object.created_date,
      updated_date: content_object.updated_date,
    };

    return transformFundraise(formattedRawFundraise);
  }
}
