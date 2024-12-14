import { User } from "@/types/user"

export interface UserApiResponse {
    id: number
    email: string
    first_name: string
    last_name: string
    author_profile?: {
      id: number
      // Add other API fields as needed
    }
  }

export function transformUserData(apiUser: any): User {


  console.log('apiUser', apiUser)
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    authorProfile: apiUser.author_profile ? {
        id: apiUser.author_profile.id,
        // Add other author profile fields as needed
      } : undefined
    };
  }