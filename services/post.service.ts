import { ApiClient } from './client';
import { Work, transformPost } from '@/types/work';
import sanitizeHtml, { Attributes } from 'sanitize-html';

interface GetContentOptions {
  cleanIntroEmptyContent?: boolean;
}

export class PostService {
  private static readonly BASE_PATH = '/api/researchhubpost';

  static async get(id: string): Promise<Work> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/${id}/`);
    return transformPost(response);
  }

  static async upsert(payload: any): Promise<Work> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/`, payload);

    return transformPost(response);
  }

  static async getContent(url: string, options: GetContentOptions = {}): Promise<string> {
    const { cleanIntroEmptyContent = true } = options;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`);
      }

      let html = await response.text();

      // Sanitize HTML with allowed tags and attributes
      html = sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'a',
          'abbr',
          'address',
          'article',
          'aside',
          'b',
          'bdi',
          'bdo',
          'blockquote',
          'br',
          'caption',
          'cite',
          'code',
          'col',
          'colgroup',
          'data',
          'dd',
          'dfn',
          'div',
          'dl',
          'dt',
          'em',
          'figcaption',
          'figure',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'hgroup',
          'hr',
          'i',
          'iframe',
          'img',
          'kbd',
          'li',
          'main',
          'mark',
          'ol',
          'p',
          'pre',
          'q',
          'rb',
          'rp',
          'rt',
          'rtc',
          'ruby',
          's',
          'samp',
          'section',
          'small',
          'source',
          'span',
          'strong',
          'sub',
          'sup',
          'table',
          'tbody',
          'td',
          'tfoot',
          'th',
          'thead',
          'time',
          'tr',
          'u',
          'ul',
          'var',
          'video',
          'wbr',
        ]),
        allowedAttributes: {
          a: ['href', 'name', 'target'],
          img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
          video: ['autoplay', 'controls', 'height', 'loop', 'muted', 'src', 'type', 'width'],
          source: ['src', 'type'],
          iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
          '*': ['class', 'style'],
        },
        transformTags: {
          iframe: function (tagName: string, attribs: Attributes) {
            const src = attribs.src || '';
            const allowedDomains = ['https://www.youtube.com'];
            const isAllowed = allowedDomains.some((domain) => src.startsWith(domain));

            if (!isAllowed) {
              return {
                tagName: 'div',
                text: 'Blocked iframe',
                attribs: {}, // Empty attributes object required by sanitize-html
              };
            }

            return {
              tagName: 'iframe',
              attribs,
            };
          },
        },
      });

      if (cleanIntroEmptyContent) {
        // Remove H1 tags since they're handled by DocumentHeader
        html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '');

        // Remove intro whitespace
        html = html.replace(/<p>((<br\/?>)*|\s*|(&nbsp;)*)*(.*?<\/p>)/, '<p>$4');

        // Remove common empty content that pushes main content down
        html = html.replace(
          /^(<p>\s*<\/p>|<p>&nbsp;<\/p>|<h2>&nbsp;<\/h2>|<h3>&nbsp;<\/h3>|<h1>&nbsp;<\/h1>|<h2>\s*<\/h2>|<h3>\s*<\/h3>|<h1>\s*<\/h1>|\s*)*/gi,
          ''
        );
      }

      return html;
    } catch (error) {
      throw new Error(
        `Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
