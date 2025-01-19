import { createTransformer, BaseTransformed } from "./transformer";

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isVerified: boolean;
    isOrganization?: boolean;
    authorProfile?: AuthorProfile;
}

export interface AuthorProfile {
    id: string;
    fullName: string;
    profileImage: string;
    headline?: string;
    user?: User;
    profileUrl: string;
}

export type TransformedUser = User & BaseTransformed;
export type TransformedAuthorProfile = AuthorProfile & BaseTransformed;

// Create base transformers without circular references
const baseTransformUser = (raw: any): User => ({
    id: raw.id,
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    fullName: raw.first_name + (raw.last_name ? " " + raw.last_name : ""),
    isVerified: raw.is_verified || false,
    isOrganization: raw.is_organization,
    authorProfile: undefined
});

const baseTransformAuthorProfile = (raw: any): AuthorProfile => ({
    id: raw.id.toString(),
    fullName: `${raw.first_name} ${raw.last_name}`.trim(),
    profileImage: raw.profile_image || '',
    headline: typeof(raw.headline) === "string" ? raw.headline : raw.headline?.title || '',
    profileUrl: raw.profile_url || '',
    user: undefined
});

// Export the wrapped transformers that handle circular references
export const transformUser = (raw: any): TransformedUser => {
    const base = createTransformer<any, User>(baseTransformUser)(raw);
    if (raw.author_profile) {
        base.authorProfile = transformAuthorProfile(raw.author_profile);
    }
    return base;
};

export const transformAuthorProfile = (raw: any): TransformedAuthorProfile => {
    const base = createTransformer<any, AuthorProfile>(baseTransformAuthorProfile)(raw);
    if (raw.user) {
        base.user = transformUser(raw.user);
    }
    return base;
};