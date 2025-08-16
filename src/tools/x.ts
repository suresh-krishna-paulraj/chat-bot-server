/**
 * X (Twitter) MCP Tool
 * Provides functionality to post and retrieve tweets using Twitter API v2
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface Tweet {
  id: string;
  text: string;
  author: string;
  created_at: string;
  likes: number;
  retweets: number;
  replies: number;
}

export class XService {
  private static client: TwitterApi | null = null;

  /**
   * Initialize Twitter API client
   */
  private static getClient(): TwitterApi {
    if (!this.client) {
      const apiKey = process.env["X_API_KEY"];
      const apiSecret = process.env["X_API_SECRET"];
      const accessToken = process.env["X_ACCESS_TOKEN"];
      const accessSecret = process.env["X_ACCESS_TOKEN_SECRET"];

      if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
        throw new Error(
          "Twitter API credentials not configured. Please set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, and X_ACCESS_TOKEN_SECRET in your .env file."
        );
      }

      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });
    }
    return this.client;
  }

  /**
   * Post a new tweet using Twitter API v2
   */
  static async postTweet(text: string, replyTo?: string): Promise<any> {
    try {
      // Validate tweet text
      if (!text || text.trim().length === 0) {
        throw new Error("Tweet text cannot be empty");
      }

      if (text.length > 280) {
        throw new Error("Tweet text cannot exceed 280 characters");
      }

      const client = this.getClient();

      // Prepare tweet parameters
      const tweetParams: any = {
        text: text,
      };

      // Add reply parameter if specified
      if (replyTo) {
        tweetParams.reply = {
          in_reply_to_tweet_id: replyTo,
        };
      }

      // Post tweet using Twitter API v2
      const tweet = await client.v2.tweet(tweetParams);

      return {
        success: true,
        tweet_id: tweet.data.id,
        text: text,
        created_at: new Date().toISOString(),
        message: "Tweet posted successfully to Twitter",
      };
    } catch (error) {
      console.error("Twitter API Error:", error);
      throw new Error(
        `Failed to post tweet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tweets by various criteria using Twitter API v2
   */
  static async getTweets(params: {
    tweetId?: string;
    username?: string;
    limit?: number;
    searchQuery?: string;
  }): Promise<any> {
    try {
      const client = this.getClient();
      let tweets: Tweet[] = [];

      if (params.tweetId) {
        // Get specific tweet by ID
        const tweet = await client.v2.singleTweet(params.tweetId, {
          "tweet.fields": ["created_at", "public_metrics", "author_id"],
        });

        if (tweet.data) {
          tweets = [
            {
              id: tweet.data.id,
              text: tweet.data.text,
              author: tweet.data.author_id || "unknown",
              created_at: tweet.data.created_at || new Date().toISOString(),
              likes: tweet.data.public_metrics?.like_count || 0,
              retweets: tweet.data.public_metrics?.retweet_count || 0,
              replies: tweet.data.public_metrics?.reply_count || 0,
            },
          ];
        }
      } else if (params.username) {
        // Get user ID first, then their tweets
        const user = await client.v2.userByUsername(params.username);
        if (user.data) {
          const userTweets = await client.v2.userTimeline(user.data.id, {
            "tweet.fields": ["created_at", "public_metrics", "author_id"],
            max_results: params.limit || 10,
          });

          tweets =
            userTweets.data.data?.map((tweet) => ({
              id: tweet.id,
              text: tweet.text,
              author: tweet.author_id || "unknown",
              created_at: tweet.created_at || new Date().toISOString(),
              likes: tweet.public_metrics?.like_count || 0,
              retweets: tweet.public_metrics?.retweet_count || 0,
              replies: tweet.public_metrics?.reply_count || 0,
            })) || [];
        }
      } else if (params.searchQuery) {
        // Search tweets
        const searchResults = await client.v2.search(params.searchQuery, {
          "tweet.fields": ["created_at", "public_metrics", "author_id"],
          max_results: params.limit || 10,
        });

        tweets =
          searchResults.data.data?.map((tweet) => ({
            id: tweet.id,
            text: tweet.text,
            author: tweet.author_id || "unknown",
            created_at: tweet.created_at || new Date().toISOString(),
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
          })) || [];
      } else {
        // Get recent tweets from authenticated user
        const me = await client.v2.me();
        const userTweets = await client.v2.userTimeline(me.data.id, {
          "tweet.fields": ["created_at", "public_metrics", "author_id"],
          max_results: params.limit || 10,
        });

        tweets =
          userTweets.data.data?.map((tweet) => ({
            id: tweet.id,
            text: tweet.text,
            author: tweet.author_id || "unknown",
            created_at: tweet.created_at || new Date().toISOString(),
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
          })) || [];
      }

      return {
        tweets,
        count: tweets.length,
        message: `Retrieved ${tweets.length} tweet(s) from Twitter`,
      };
    } catch (error) {
      console.error("Twitter API Error:", error);
      throw new Error(
        `Failed to retrieve tweets: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Like a tweet using Twitter API v2
   */
  static async likeTweet(tweetId: string): Promise<any> {
    try {
      const client = this.getClient();
      const me = await client.v2.me();

      await client.v2.like(me.data.id, tweetId);

      return {
        success: true,
        message: `Tweet ${tweetId} liked successfully on Twitter`,
      };
    } catch (error) {
      console.error("Twitter API Error:", error);
      throw new Error(
        `Failed to like tweet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Retweet a tweet using Twitter API v2
   */
  static async retweet(tweetId: string): Promise<any> {
    try {
      const client = this.getClient();
      const me = await client.v2.me();

      await client.v2.retweet(me.data.id, tweetId);

      return {
        success: true,
        message: `Tweet ${tweetId} retweeted successfully on Twitter`,
      };
    } catch (error) {
      console.error("Twitter API Error:", error);
      throw new Error(
        `Failed to retweet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a tweet using Twitter API v2
   */
  static async deleteTweet(tweetId: string): Promise<any> {
    try {
      const client = this.getClient();

      await client.v2.deleteTweet(tweetId);

      return {
        success: true,
        message: `Tweet ${tweetId} deleted successfully from Twitter`,
      };
    } catch (error) {
      console.error("Twitter API Error:", error);
      throw new Error(
        `Failed to delete tweet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get trending topics (mock implementation)
   */
  static async getTrendingTopics(): Promise<any> {
    try {
      // Mock trending topics
      const topics = [
        "#AI",
        "#Technology",
        "#Programming",
        "#WebDevelopment",
        "#MachineLearning",
      ];

      return {
        topics,
        message: "Retrieved trending topics",
      };
    } catch (error) {
      throw new Error(
        `Failed to get trending topics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Post Tweet Tool
const postTweetSchema = z.object({
  text: z.string().describe("The text content of the tweet to post"),
  replyTo: z.string().optional().describe("Tweet ID to reply to (optional)"),
});

const postTweetTool = tool(
  async ({ text, replyTo }) => {
    return await XService.postTweet(text, replyTo);
  },
  {
    name: "post_tweet",
    description:
      "Post a new tweet to X (Twitter). The tweet text must be 280 characters or less.",
    schema: postTweetSchema,
  }
);

// Get Tweets Tool
const getTweetsSchema = z.object({
  tweetId: z.string().optional().describe("Specific tweet ID to retrieve"),
  username: z.string().optional().describe("Username to get tweets from"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of tweets to retrieve (default: 10)"),
  searchQuery: z.string().optional().describe("Search query to filter tweets"),
});

const getTweetsTool = tool(
  async ({ tweetId, username, limit, searchQuery }) => {
    const params: {
      tweetId?: string;
      username?: string;
      limit?: number;
      searchQuery?: string;
    } = {};
    if (tweetId) params.tweetId = tweetId;
    if (username) params.username = username;
    if (limit) params.limit = limit;
    if (searchQuery) params.searchQuery = searchQuery;
    return await XService.getTweets(params);
  },
  {
    name: "get_tweets",
    description:
      "Retrieve tweets from X (Twitter) by ID, username, search query, or get recent tweets from authenticated user.",
    schema: getTweetsSchema,
  }
);

// Like Tweet Tool
const likeTweetSchema = z.object({
  tweetId: z.string().describe("The ID of the tweet to like"),
});

const likeTweetTool = tool(
  async ({ tweetId }) => {
    return await XService.likeTweet(tweetId);
  },
  {
    name: "like_tweet",
    description: "Like a specific tweet on X (Twitter) using its tweet ID.",
    schema: likeTweetSchema,
  }
);

// Retweet Tool
const retweetSchema = z.object({
  tweetId: z.string().describe("The ID of the tweet to retweet"),
});

const retweetTool = tool(
  async ({ tweetId }) => {
    return await XService.retweet(tweetId);
  },
  {
    name: "retweet",
    description: "Retweet a specific tweet on X (Twitter) using its tweet ID.",
    schema: retweetSchema,
  }
);

// Delete Tweet Tool
const deleteTweetSchema = z.object({
  tweetId: z.string().describe("The ID of the tweet to delete"),
});

const deleteTweetTool = tool(
  async ({ tweetId }) => {
    return await XService.deleteTweet(tweetId);
  },
  {
    name: "delete_tweet",
    description: "Delete a specific tweet from X (Twitter) using its tweet ID.",
    schema: deleteTweetSchema,
  }
);

// Get Trending Topics Tool
const getTrendingTopicsTool = tool(
  async () => {
    return await XService.getTrendingTopics();
  },
  {
    name: "get_trending_topics",
    description:
      "Get trending topics on X (Twitter). Currently returns mock data.",
  }
);

// Export all tools
export const xTools = [
  postTweetTool,
  getTweetsTool,
  likeTweetTool,
  retweetTool,
  deleteTweetTool,
  getTrendingTopicsTool,
];

// Export individual tools for convenience
export {
  postTweetTool,
  getTweetsTool,
  likeTweetTool,
  retweetTool,
  deleteTweetTool,
  getTrendingTopicsTool,
};
