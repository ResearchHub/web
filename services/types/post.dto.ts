export enum DocumentType {
  DISCUSSION = 'DISCUSSION',
  ELN = 'ELN',
  POSTS = 'POSTS',
  QUESTION = 'QUESTION',
  BOUNTY = 'BOUNTY',
  PREREGISTRATION = 'PREREGISTRATION',
}

export enum EditorType {
  CK_EDITOR = 'CK_EDITOR',
  DRAFT_JS = 'DRAFT_JS',
  TEXT_FIELD = 'TEXT_FIELD',
}

export enum Currency {
  USD = 'USD',
  ETHER = 'ETHER',
  RSC = 'RSC',
}

export interface PostPayload {
  // Required fields with validation
  document_type: DocumentType;
  title: string;
  renderable_text: string;
  full_src: string;

  // Optional fields
  authors?: number[];
  note_id?: number | null;
  editor_type?: EditorType;
  assign_doi?: boolean;
  preview_img?: string;
  bounty_type?: string;
  hubs?: number[];

  fundraise_goal_currency?: Currency;
  fundraise_goal_amount?: number;

  hypothesis: string;
  methods: string;
  // budget: string;
  budgetUse: string;
  rewardFunders: boolean;
  nftArt: File | null;
  nftSupply: string;
}
