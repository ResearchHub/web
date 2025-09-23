import { createTransformer } from './transformer';
import { Topic, transformTopic } from './topic';

export interface FollowResponse {
  id: number;
  type: 'HUB' | 'PAPER' | 'POST' | 'BOUNTY' | string;
  object_id: number;
  followed_object: any; // The actual hub, paper, post data
  created_date: string;
  updated_date: string;
}

export type FollowedObject = {
  id: number;
  type: string;
  objectId: number;
  createdDate: string;
  updatedDate: string;
  data: Topic | any; // Can be Topic, Paper, etc. based on type
};

export const transformFollowedObject = createTransformer<FollowResponse, FollowedObject>(
  (raw: FollowResponse) => {
    let transformedData: any = null;

    // Transform based on the type
    if (raw.type === 'HUB' && raw.followed_object) {
      // For hub objects, use the topic transformer on the followed_object
      transformedData = transformTopic(raw.followed_object);
    } else if (raw.followed_object) {
      // For other types (papers, etc.), we can add transformers later
      transformedData = raw.followed_object;
    }

    return {
      id: raw.id,
      type: raw.type,
      objectId: raw.object_id,
      createdDate: raw.created_date,
      updatedDate: raw.updated_date,
      data: transformedData,
    };
  }
);
