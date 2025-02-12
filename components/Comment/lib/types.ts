export interface MentionItem {
  id: string | null;
  entityType: 'user' | 'author' | 'paper' | 'post';
  label: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  authorProfileId?: string | null;
  isVerified?: boolean;
  authorProfile?: {
    headline: string;
    profileImage: string | null;
  };
  // Paper specific fields
  authors?: string[];
  doi?: string;
  citations?: number;
  source?: string;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}
