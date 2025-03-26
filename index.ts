#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Argument type definitions for esa tools
interface ListPostsArgs {
  q?: string;
  include?: string;
  sort?: string;
  order?: string;
  per_page?: number;
  page?: number;
}

interface GetPostArgs {
  post_number: number;
  include?: string;
}

interface CreatePostArgs {
  name: string;
  body_md?: string;
  tags?: string[];
  category?: string;
  wip?: boolean;
  message?: string;
  user?: string;
  template_post_id?: number;
}

interface UpdatePostArgs {
  post_number: number;
  name?: string;
  body_md?: string;
  tags?: string[];
  category?: string;
  wip?: boolean;
  message?: string;
  created_by?: string;
  original_revision?: string;
}

interface ListCommentsArgs {
  post_number: number;
  page?: number;
  per_page?: number;
}

interface GetCommentArgs {
  comment_id: number;
  include?: string;
}

interface CreateCommentArgs {
  post_number: number;
  body_md: string;
  user?: string;
}

interface GetMembersArgs {
  page?: number;
  per_page?: number;
}

interface GetMemberArgs {
  screen_name_or_email: string;
}

// ツール定義
const listPostsTool: Tool = {
  name: "esa_list_posts",
  description: "Get a list of posts in the team (with pagination support)",
  inputSchema: {
    type: "object",
    properties: {
      q: {
        type: "string",
        description: "Search query (see esa API documentation for details)",
      },
      include: {
        type: "string",
        description: "Related data to include in the response (e.g. 'comments,stargazers')",
      },
      sort: {
        type: "string",
        description: "Sort method (updated, created, number, stars, watches, comments, best_match)",
        default: "updated",
      },
      order: {
        type: "string",
        description: "Sort order (desc, asc)",
        default: "desc",
      },
      per_page: {
        type: "number",
        description: "Number of results per page (default: 20, max: 100)",
        default: 20,
      },
      page: {
        type: "number",
        description: "Page number to retrieve",
        default: 1,
      },
    },
  },
};

const getPostTool: Tool = {
  name: "esa_get_post",
  description: "Get detailed information about a specific post",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "Post number to retrieve",
      },
      include: {
        type: "string",
        description: "Related data to include in the response (e.g. 'comments,stargazers')",
      },
    },
    required: ["post_number"],
  },
};

const createPostTool: Tool = {
  name: "esa_create_post",
  description: "Create a new post",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Post title",
      },
      body_md: {
        type: "string",
        description: "Post body (Markdown format)",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "List of tags for the post",
      },
      category: {
        type: "string",
        description: "Post category",
      },
      wip: {
        type: "boolean",
        description: "Whether to mark as WIP (Work In Progress)",
        default: true,
      },
      message: {
        type: "string",
        description: "Change message",
      },
      user: {
        type: "string",
        description: "Poster's screen_name (only team owners can specify)",
      },
      template_post_id: {
        type: "number",
        description: "ID of the post to use as a template",
      },
    },
    required: ["name"],
  },
};

const updatePostTool: Tool = {
  name: "esa_update_post",
  description: "Update an existing post",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "Post number to update",
      },
      name: {
        type: "string",
        description: "New title for the post",
      },
      body_md: {
        type: "string",
        description: "New body for the post (Markdown format)",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "New list of tags for the post",
      },
      category: {
        type: "string",
        description: "New category for the post",
      },
      wip: {
        type: "boolean",
        description: "Whether to mark as WIP (Work In Progress)",
      },
      message: {
        type: "string",
        description: "Change message",
      },
      created_by: {
        type: "string",
        description: "Poster's screen_name (only team owners can specify)",
      },
      original_revision: {
        type: "string",
        description: "Revision to base the update on",
      },
    },
    required: ["post_number"],
  },
};

const listCommentsTool: Tool = {
  name: "esa_list_comments",
  description: "Get a list of comments for a post",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "Post number to get comments for",
      },
      page: {
        type: "number",
        description: "Page number to retrieve",
        default: 1,
      },
      per_page: {
        type: "number",
        description: "Number of results per page (default: 20, max: 100)",
        default: 20,
      },
    },
    required: ["post_number"],
  },
};

const getCommentTool: Tool = {
  name: "esa_get_comment",
  description: "Get a specific comment",
  inputSchema: {
    type: "object",
    properties: {
      comment_id: {
        type: "number",
        description: "ID of the comment to retrieve",
      },
      include: {
        type: "string",
        description: "レスポンスに含める関連データ (例: 'stargazers')",
      },
    },
    required: ["comment_id"],
  },
};

const createCommentTool: Tool = {
  name: "esa_create_comment",
  description: "Post a comment to an article",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "Post number to comment on",
      },
      body_md: {
        type: "string",
        description: "Comment body (Markdown format)",
      },
      user: {
        type: "string",
        description: "Poster's screen_name (only team owners can specify)",
      },
    },
    required: ["post_number", "body_md"],
  },
};

const getMembersTool: Tool = {
  name: "esa_get_members",
  description: "Get a list of team members",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number to retrieve",
        default: 1,
      },
      per_page: {
        type: "number",
        description: "Number of results per page (default: 20, max: 100)",
        default: 20,
      },
    },
  },
};

const getMemberTool: Tool = {
  name: "esa_get_member",
  description: "Get information about a specific team member",
  inputSchema: {
    type: "object",
    properties: {
      screen_name_or_email: {
        type: "string",
        description: "Screen name or email of the member to retrieve",
      },
    },
    required: ["screen_name_or_email"],
  },
};

class EsaClient {
  private baseUrl: string;
  private headers: { Authorization: string; "Content-Type": string };

  constructor(accessToken: string, teamName: string) {
    this.baseUrl = `https://api.esa.io/v1/teams/${teamName}`;
    this.headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }

  async listPosts(args: ListPostsArgs = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (args.q) params.append("q", args.q);
    if (args.include) params.append("include", args.include);
    if (args.sort) params.append("sort", args.sort);
    if (args.order) params.append("order", args.order);
    if (args.per_page) params.append("per_page", args.per_page.toString());
    if (args.page) params.append("page", args.page.toString());

    const url = `${this.baseUrl}/posts${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: this.headers });

    return response.json();
  }

  async getPost(post_number: number, include?: string): Promise<any> {
    const params = new URLSearchParams();
    
    if (include) params.append("include", include);

    const url = `${this.baseUrl}/posts/${post_number}${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: this.headers });

    return response.json();
  }

  async createPost(postData: Omit<CreatePostArgs, 'template_post_id'> & { template_post_id?: number }): Promise<any> {
    const url = `${this.baseUrl}/posts`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ post: postData }),
    });

    return response.json();
  }

  async updatePost(post_number: number, postData: Omit<UpdatePostArgs, 'post_number'>): Promise<any> {
    const url = `${this.baseUrl}/posts/${post_number}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({ post: postData }),
    });

    return response.json();
  }

  async listComments(post_number: number, page?: number, per_page?: number): Promise<any> {
    const params = new URLSearchParams();
    
    if (page) params.append("page", page.toString());
    if (per_page) params.append("per_page", per_page.toString());

    const url = `${this.baseUrl}/posts/${post_number}/comments${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: this.headers });

    return response.json();
  }

  async getComment(comment_id: number, include?: string): Promise<any> {
    const params = new URLSearchParams();
    
    if (include) params.append("include", include);

    const url = `${this.baseUrl}/comments/${comment_id}${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: this.headers });

    return response.json();
  }

  async createComment(post_number: number, body_md: string, user?: string): Promise<any> {
    const url = `${this.baseUrl}/posts/${post_number}/comments`;
    const commentData: { body_md: string; user?: string } = { body_md };
    
    if (user) commentData.user = user;

    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ comment: commentData }),
    });

    return response.json();
  }

  async getMembers(page?: number, per_page?: number): Promise<any> {
    const params = new URLSearchParams();
    
    if (page) params.append("page", page.toString());
    if (per_page) params.append("per_page", per_page.toString());

    const url = `${this.baseUrl}/members${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: this.headers });

    return response.json();
  }

  async getMember(screen_name_or_email: string): Promise<any> {
    const url = `${this.baseUrl}/members/${screen_name_or_email}`;
    const response = await fetch(url, { headers: this.headers });

    return response.json();
  }
}

async function main() {
  const accessToken = process.env.ESA_ACCESS_TOKEN;
  const teamName = process.env.ESA_TEAM;

  if (!accessToken || !teamName) {
    console.error(
      "Please set the ESA_ACCESS_TOKEN and ESA_TEAM environment variables",
    );
    process.exit(1);
  }

  console.error("Starting esa MCP Server...");
  const server = new Server(
    {
      name: "esa MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const esaClient = new EsaClient(accessToken, teamName);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("CallToolRequest received:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "esa_list_posts": {
            const args = request.params.arguments as unknown as ListPostsArgs;
            const response = await esaClient.listPosts(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_get_post": {
            const args = request.params.arguments as unknown as GetPostArgs;
            if (!args.post_number) {
              throw new Error("post_number is required");
            }
            const response = await esaClient.getPost(args.post_number, args.include);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_create_post": {
            const args = request.params.arguments as unknown as CreatePostArgs;
            if (!args.name) {
              throw new Error("name is required");
            }
            const response = await esaClient.createPost(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_update_post": {
            const args = request.params.arguments as unknown as UpdatePostArgs;
            if (!args.post_number) {
              throw new Error("post_number is required");
            }
            const { post_number, ...postData } = args;
            const response = await esaClient.updatePost(post_number, postData);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_list_comments": {
            const args = request.params.arguments as unknown as ListCommentsArgs;
            if (!args.post_number) {
              throw new Error("post_number is required");
            }
            const response = await esaClient.listComments(
              args.post_number,
              args.page,
              args.per_page
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_get_comment": {
            const args = request.params.arguments as unknown as GetCommentArgs;
            if (!args.comment_id) {
              throw new Error("comment_id is required");
            }
            const response = await esaClient.getComment(args.comment_id, args.include);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_create_comment": {
            const args = request.params.arguments as unknown as CreateCommentArgs;
            if (!args.post_number || !args.body_md) {
              throw new Error("post_number and body_md are required");
            }
            const response = await esaClient.createComment(
              args.post_number,
              args.body_md,
              args.user
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_get_members": {
            const args = request.params.arguments as unknown as GetMembersArgs;
            const response = await esaClient.getMembers(args.page, args.per_page);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_get_member": {
            const args = request.params.arguments as unknown as GetMemberArgs;
            if (!args.screen_name_or_email) {
              throw new Error("screen_name_or_email is required");
            }
            const response = await esaClient.getMember(args.screen_name_or_email);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Tool execution error:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("ListToolsRequest received");
    return {
      tools: [
        listPostsTool,
        getPostTool,
        createPostTool,
        updatePostTool,
        listCommentsTool,
        getCommentTool,
        createCommentTool,
        getMembersTool,
        getMemberTool,
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("esa MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
