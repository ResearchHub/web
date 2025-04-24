interface Author {
  firstName: string;
  lastName: string;
  position: string;
}

interface UserSavedIdentifier {
  idType: 'paperId' | 'uDocId';
  id: number;
}

export type { UserSavedIdentifier };
