import { Youtube as TiptapYoutube } from '@tiptap/extension-youtube';

export const Youtube = TiptapYoutube.configure({
  // Default configuration
  inline: false,
  width: 640,
  height: 480,
  controls: true,
  nocookie: false,
  allowFullscreen: true,
  // Optional: Add any other configurations you want from the docs
  // modestBranding: true,
  // ccLanguage: 'en',
  // autoplay: false,
});
