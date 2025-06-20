import { TwitterApi } from 'twitter-api-v2';

export interface XCredentials {
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
}

export class XHelper {
  private client: TwitterApi;

  constructor(credentials: XCredentials) {
    this.client = new TwitterApi({
      appKey: credentials.appKey,
      appSecret: credentials.appSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessSecret,
    });
  }

  async postArticleSummary(
    title: string,
    topics: string[],
    qiitaUrl: string
  ): Promise<{ id: string; url: string }> {
    // Create hashtags from topics
    const hashtags = topics
      .slice(0, 3) // Limit to 3 hashtags
      .map(topic => `#${topic}`)
      .join(' ');

    // Compose tweet text
    const tweetText = `📝 ${title}\n\n${hashtags}\n\n${qiitaUrl}`;

    // Post tweet
    const tweet = await this.client.v2.tweet(tweetText);

    return {
      id: tweet.data.id,
      url: `https://x.com/user/status/${tweet.data.id}`,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.v2.me();
      return true;
    } catch (error) {
      return false;
    }
  }
}