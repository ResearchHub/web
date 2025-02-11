export interface MentionItem {
  id: string;
  label: string;
  entityType: 'paper' | 'user' | 'author' | 'post';
  authorProfileId?: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  authors?: string[];
  doi?: string;
  citations?: number;
  source?: string;
  isVerified?: boolean;
  authorProfile?: {
    headline?: { title: string; isPublic?: boolean } | string;
    profileImage?: string | null;
  };
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}
