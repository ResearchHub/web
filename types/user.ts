export interface User {
    id: string
    username: string
    email: string
    isVerified: boolean
    isOrganization?: boolean
    fullName: string
}

export interface AuthorProfile {
    id: string
    fullName: string
    profileImage: string
    headline?: string
    user?: User
    profileUrl: string
}