#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// esaツール用の引数型定義
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

interface DeletePostArgs {
  post_number: number;
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
  description: "チーム内の記事リストを取得します（ページネーション対応）",
  inputSchema: {
    type: "object",
    properties: {
      q: {
        type: "string",
        description: "検索クエリ（詳細は esa API ドキュメント参照）",
      },
      include: {
        type: "string",
        description: "レスポンスに含める関連データ (例: 'comments,stargazers')",
      },
      sort: {
        type: "string",
        description: "ソート方法 (updated, created, number, stars, watches, comments, best_match)",
        default: "updated",
      },
      order: {
        type: "string",
        description: "ソート順 (desc, asc)",
        default: "desc",
      },
      per_page: {
        type: "number",
        description: "1ページあたりの結果数 (デフォルト: 20, 最大: 100)",
        default: 20,
      },
      page: {
        type: "number",
        description: "取得するページ番号",
        default: 1,
      },
    },
  },
};

const getPostTool: Tool = {
  name: "esa_get_post",
  description: "特定の記事の詳細情報を取得します",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "取得する記事番号",
      },
      include: {
        type: "string",
        description: "レスポンスに含める関連データ (例: 'comments,stargazers')",
      },
    },
    required: ["post_number"],
  },
};

const createPostTool: Tool = {
  name: "esa_create_post",
  description: "新しい記事を作成します",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "記事のタイトル",
      },
      body_md: {
        type: "string",
        description: "記事の本文 (Markdown形式)",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "記事に付けるタグのリスト",
      },
      category: {
        type: "string",
        description: "記事のカテゴリ",
      },
      wip: {
        type: "boolean",
        description: "WIP (作業中) としてマークするかどうか",
        default: true,
      },
      message: {
        type: "string",
        description: "変更メッセージ",
      },
      user: {
        type: "string",
        description: "投稿者のscreen_name（チームオーナーのみ指定可能）",
      },
      template_post_id: {
        type: "number",
        description: "テンプレートとして使用する記事のID",
      },
    },
    required: ["name"],
  },
};

const updatePostTool: Tool = {
  name: "esa_update_post",
  description: "既存の記事を更新します",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "更新する記事番号",
      },
      name: {
        type: "string",
        description: "記事の新しいタイトル",
      },
      body_md: {
        type: "string",
        description: "記事の新しい本文 (Markdown形式)",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "記事の新しいタグのリスト",
      },
      category: {
        type: "string",
        description: "記事の新しいカテゴリ",
      },
      wip: {
        type: "boolean",
        description: "WIP (作業中) としてマークするかどうか",
      },
      message: {
        type: "string",
        description: "変更メッセージ",
      },
      created_by: {
        type: "string",
        description: "投稿者のscreen_name（チームオーナーのみ指定可能）",
      },
      original_revision: {
        type: "string",
        description: "更新の基準となるリビジョン",
      },
    },
    required: ["post_number"],
  },
};

const deletePostTool: Tool = {
  name: "esa_delete_post",
  description: "記事を削除します",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "削除する記事番号",
      },
    },
    required: ["post_number"],
  },
};

const listCommentsTool: Tool = {
  name: "esa_list_comments",
  description: "記事のコメント一覧を取得します",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "コメントを取得する記事番号",
      },
      page: {
        type: "number",
        description: "取得するページ番号",
        default: 1,
      },
      per_page: {
        type: "number",
        description: "1ページあたりの結果数 (デフォルト: 20, 最大: 100)",
        default: 20,
      },
    },
    required: ["post_number"],
  },
};

const getCommentTool: Tool = {
  name: "esa_get_comment",
  description: "特定のコメントを取得します",
  inputSchema: {
    type: "object",
    properties: {
      comment_id: {
        type: "number",
        description: "取得するコメントのID",
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
  description: "記事にコメントを投稿します",
  inputSchema: {
    type: "object",
    properties: {
      post_number: {
        type: "number",
        description: "コメントを投稿する記事番号",
      },
      body_md: {
        type: "string",
        description: "コメントの本文 (Markdown形式)",
      },
      user: {
        type: "string",
        description: "投稿者のscreen_name（チームオーナーのみ指定可能）",
      },
    },
    required: ["post_number", "body_md"],
  },
};

const getMembersTool: Tool = {
  name: "esa_get_members",
  description: "チームのメンバー一覧を取得します",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "取得するページ番号",
        default: 1,
      },
      per_page: {
        type: "number",
        description: "1ページあたりの結果数 (デフォルト: 20, 最大: 100)",
        default: 20,
      },
    },
  },
};

const getMemberTool: Tool = {
  name: "esa_get_member",
  description: "特定のチームメンバーの情報を取得します",
  inputSchema: {
    type: "object",
    properties: {
      screen_name_or_email: {
        type: "string",
        description: "取得するメンバーのスクリーンネームまたはメールアドレス",
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

  async deletePost(post_number: number): Promise<any> {
    const url = `${this.baseUrl}/posts/${post_number}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.headers,
    });

    return response.status === 204 ? { success: true } : response.json();
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
      "ESA_ACCESS_TOKEN と ESA_TEAM 環境変数を設定してください",
    );
    process.exit(1);
  }

  console.error("esa MCP Server 起動中...");
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
      console.error("CallToolRequest 受信:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("引数がありません");
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
              throw new Error("post_number は必須です");
            }
            const response = await esaClient.getPost(args.post_number, args.include);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_create_post": {
            const args = request.params.arguments as unknown as CreatePostArgs;
            if (!args.name) {
              throw new Error("name は必須です");
            }
            const response = await esaClient.createPost(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_update_post": {
            const args = request.params.arguments as unknown as UpdatePostArgs;
            if (!args.post_number) {
              throw new Error("post_number は必須です");
            }
            const { post_number, ...postData } = args;
            const response = await esaClient.updatePost(post_number, postData);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_delete_post": {
            const args = request.params.arguments as unknown as DeletePostArgs;
            if (!args.post_number) {
              throw new Error("post_number は必須です");
            }
            const response = await esaClient.deletePost(args.post_number);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_list_comments": {
            const args = request.params.arguments as unknown as ListCommentsArgs;
            if (!args.post_number) {
              throw new Error("post_number は必須です");
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
              throw new Error("comment_id は必須です");
            }
            const response = await esaClient.getComment(args.comment_id, args.include);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "esa_create_comment": {
            const args = request.params.arguments as unknown as CreateCommentArgs;
            if (!args.post_number || !args.body_md) {
              throw new Error("post_number と body_md は必須です");
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
              throw new Error("screen_name_or_email は必須です");
            }
            const response = await esaClient.getMember(args.screen_name_or_email);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`不明なツール: ${request.params.name}`);
        }
      } catch (error) {
        console.error("ツール実行エラー:", error);
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
    console.error("ListToolsRequest 受信");
    return {
      tools: [
        listPostsTool,
        getPostTool,
        createPostTool,
        updatePostTool,
        deletePostTool,
        listCommentsTool,
        getCommentTool,
        createCommentTool,
        getMembersTool,
        getMemberTool,
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("サーバーをトランスポートに接続中...");
  await server.connect(transport);

  console.error("esa MCP Server が stdio で実行中");
}

main().catch((error) => {
  console.error("main()で致命的なエラー:", error);
  process.exit(1);
});
