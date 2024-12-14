export interface User {
    id: number
    email: string
    firstName: string
    lastName: string
    authorProfile?: AuthorProfile
  }
  
  export interface AuthorProfile {
    id: number
  }