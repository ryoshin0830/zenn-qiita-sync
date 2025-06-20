import { TwitterApi } from 'twitter-api-v2';
export class XHelper {
    client;
    constructor(credentials) {
        this.client = new TwitterApi({
            appKey: credentials.appKey,
            appSecret: credentials.appSecret,
            accessToken: credentials.accessToken,
            accessSecret: credentials.accessSecret,
        });
    }
    async postArticleSummary(title, topics, qiitaUrl) {
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
    async testConnection() {
        try {
            await this.client.v2.me();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=x-helper.js.map