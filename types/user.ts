export interface User {
    id: number
    email: string
    fullName: string
    isVerified?: boolean
    isOrganization?: boolean
    authorProfile?: AuthorProfile
  }
  
  export interface AuthorProfile {
    id: number
    profileImage: string
    headline: string
  }