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

  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.first_name + (apiUser.last_name ? " " + apiUser.last_name : ""),
    authorProfile: apiUser.author_profile ? {
        id: apiUser.author_profile.id,
        profileImage: apiUser.author_profile.profile_image,
        headline: typeof(apiUser.author_profile.headline) === "string" ? apiUser.author_profile.headline : apiUser.author_profile.headline?.title,
      } : undefined
    };
  }