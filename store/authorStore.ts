export const authors = [
  {
    id: 7603557,
    profileImage:
      'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/07/blob_XuLhgBK',
    fullName: 'Peng Li',
  },
  {
    id: 993107,
    profileImage:
      'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
    fullName: 'Dominikus Brian',
  },
  {
    id: 766535,
    profileImage:
      'https://lh3.googleusercontent.com/a-/AOh14GiFV6cDpC2to8QkhZ1OjdqMPKRpPn9SJOg3vAb_RA=s96-c',
    fullName: 'David Reinstein',
  },
  {
    id: 952195,
    profileImage:
      'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/07/29/blob',
    fullName: 'Cole Delyea',
  },
  {
    id: 974416,
    profileImage:
      'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/09/16/blob',
    fullName: 'Pedro Paulo Gattai Gomes',
  },
];

// Review statuses for papers
export type ReviewStatus = 'pending' | 'approved' | 'needs_changes' | 'rejected' | 'unassigned';

export interface PeerReview {
  paperId: number;
  reviewerId: number | null; // null if unassigned
  status: ReviewStatus;
  comment?: string;
  date?: string;
}

// Sample peer review data
export const peerReviews: PeerReview[] = [
  {
    paperId: 9196125,
    reviewerId: 7603557, // Peng Li
    status: 'needs_changes',
    comment:
      'Please revise the methodology section and add more details about the data processing steps.',
    date: '2025-03-11',
  },
  {
    paperId: 9267860,
    reviewerId: 7603557,
    status: 'approved',
    comment: 'Waiting for reviewer assignment',
  },
  {
    paperId: 9267860,
    reviewerId: 766535,
    status: 'approved',
    comment: 'Waiting for reviewer assignment',
  },

  {
    paperId: 9196125,
    reviewerId: null, // Dominikus Brian
    status: 'unassigned',
    comment: 'The methodology is sound and the results are well-presented. Ready for publication.',
    date: '2025-03-10',
  },

  {
    paperId: 9264290,
    reviewerId: 766535, // David Reinstein
    status: 'needs_changes',
    comment: 'Excellent methodology and thorough literature review. Ready for publication.',
    date: '2025-03-08',
  },
  {
    paperId: 9264290,
    reviewerId: 974416, // Pedro Paulo
    status: 'approved',
    comment: 'The study is well-designed and the conclusions are strongly supported by the data.',
    date: '2025-03-09',
  },

  {
    paperId: 9264291,
    reviewerId: 952195, // Cole Delyea
    status: 'pending',
    comment: 'Review in progress, will submit comments by next week.',
    date: '2025-03-12',
  },
  {
    paperId: 9264291,
    reviewerId: 993107, // Dominikus Brian
    status: 'pending',
    comment: 'Currently reviewing the statistical analysis section.',
    date: '2025-03-12',
  },

  {
    paperId: 9264292,
    reviewerId: 766535, // David Reinstein
    status: 'approved',
    comment: 'Novel approach with sound methodology. Recommend publication.',
    date: '2025-03-10',
  },
  {
    paperId: 9264292,
    reviewerId: 7603557, // Peng Li
    status: 'needs_changes',
    comment: 'The analysis is promising but needs more rigorous statistical testing.',
    date: '2025-03-11',
  },
  {
    paperId: 9324244,
    reviewerId: null,
    status: 'unassigned',
    comment: 'Novel approach with sound methodology. Recommend publication.',
    date: '2025-03-10',
  },
  {
    paperId: 9324244,
    reviewerId: 952195,
    status: 'needs_changes',
    comment: 'The analysis is promising but needs more rigorous statistical testing.',
    date: '2025-03-11',
  },
];
