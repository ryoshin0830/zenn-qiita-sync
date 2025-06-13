export interface ZennFrontmatter {
  title: string;
  emoji: string;
  type: 'tech' | 'idea';
  topics: string[];
  published: boolean;
  published_at?: string;
}

export interface QiitaFrontmatter {
  title: string;
  tags: Array<{ name: string }>;
  private: boolean;
  updated_at: string;
  id: string | null;
  organization_url_name: string | null;
  slide: boolean;
  ignorePublish: boolean;
}

export interface ArticleMetadata {
  filePath: string;
  content: string;
  zennSlug?: string;
  qiitaId?: string | null;
}