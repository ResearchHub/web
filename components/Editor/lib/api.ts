import { AssetService } from '../../../services/asset.service';

export class API {
  public static uploadImage = async (file: File) => {
    try {
      const result = await AssetService.uploadFile(file, 'note');
      return result.absoluteUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };
}

export default API;
