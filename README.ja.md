# esa MCP サーバー

## 概要

このサーバーは、[Model Context Protocol (MCP)](https://github.com/anthropics/anthropic-cookbook/tree/main/model_context_protocol)を使用して、Claude AIが[esa API](https://docs.esa.io/posts/102)と対話できるようにするためのインターフェースです。

このMCPサーバーによって、Claude AIはesaのドキュメントの検索、作成、更新などの操作を行えるようになります。

## リポジトリについて

このリポジトリは、esa MCPサーバーの独立した実装を提供します。Claude AIとesaを統合し、ドキュメント管理を効率化します。

## セットアップ

### 前提条件

- Node.js 18以上
- esaのAPIアクセストークン
- esaのチーム名

### インストール

```bash
# 必要なパッケージをインストール
npm install
```

### 環境変数の設定

```bash
# 環境変数の設定
export ESA_ACCESS_TOKEN="your_esa_access_token"
export ESA_TEAM="your_team_name"
```

### サーバーの起動

```bash
# サーバーを起動
npm start
```

## 利用可能なツール

このMCPサーバーは以下のツールを提供します：

### 記事関連

1. `esa_list_posts`
   - チーム内の記事リストを取得します
   - 入力:
     - `q` (string, optional): 検索クエリ
     - `include` (string, optional): レスポンスに含める関連データ (例: 'comments,stargazers')
     - `sort` (string, optional): ソート方法 (updated, created, number, stars, watches, comments, best_match)
     - `order` (string, optional): ソート順 (desc, asc)
     - `per_page` (number, optional): 1ページあたりの結果数 (最大: 100)
     - `page` (number, optional): 取得するページ番号

2. `esa_get_post`
   - 特定の記事の詳細情報を取得します
   - 入力:
     - `post_number` (number, required): 取得する記事番号
     - `include` (string, optional): レスポンスに含める関連データ (例: 'comments,stargazers')

3. `esa_create_post`
   - 新しい記事を作成します
   - 入力:
     - `name` (string, required): 記事のタイトル
     - `body_md` (string, optional): 記事の本文 (Markdown形式)
     - `tags` (array of string, optional): 記事に付けるタグのリスト
     - `category` (string, optional): 記事のカテゴリ
     - `wip` (boolean, optional, default: true): WIP (作業中) としてマークするかどうか
     - `message` (string, optional): 変更メッセージ
     - `user` (string, optional): 投稿者のscreen_name (チームオーナーのみ指定可能)
     - `template_post_id` (number, optional): テンプレートとして使用する記事のID

4. `esa_update_post`
   - 既存の記事を更新します
   - 入力:
     - `post_number` (number, required): 更新する記事番号
     - `name` (string, optional): 記事の新しいタイトル
     - `body_md` (string, optional): 記事の新しい本文 (Markdown形式)
     - `tags` (array of string, optional): 記事の新しいタグのリスト
     - `category` (string, optional): 記事の新しいカテゴリ
     - `wip` (boolean, optional): WIP (作業中) としてマークするかどうか
     - `message` (string, optional): 変更メッセージ
     - `created_by` (string, optional): 投稿者のscreen_name (チームオーナーのみ指定可能)
     - `original_revision` (string, optional): 更新の基準となるリビジョン

### コメント関連

1. `esa_list_comments`
   - 記事のコメント一覧を取得します
   - 入力:
     - `post_number` (number, required): コメントを取得する記事番号
     - `page` (number, optional): 取得するページ番号
     - `per_page` (number, optional): 1ページあたりの結果数 (最大: 100)

2. `esa_get_comment`
   - 特定のコメントを取得します
   - 入力:
     - `comment_id` (number, required): 取得するコメントのID
     - `include` (string, optional): レスポンスに含める関連データ (例: 'stargazers')

3. `esa_create_comment`
   - 記事にコメントを投稿します
   - 入力:
     - `post_number` (number, required): コメントを投稿する記事番号
     - `body_md` (string, required): コメントの本文 (Markdown形式)
     - `user` (string, optional): 投稿者のscreen_name (チームオーナーのみ指定可能)

### メンバー関連

1. `esa_get_members`
   - チームのメンバー一覧を取得します
   - 入力:
     - `page` (number, optional): 取得するページ番号
     - `per_page` (number, optional): 1ページあたりの結果数 (最大: 100)

2. `esa_get_member`
   - 特定のチームメンバーの情報を取得します
   - 入力:
     - `screen_name_or_email` (string, required): 取得するメンバーのスクリーンネームまたはメールアドレス

## 使用例

以下はClaudeがこのMCPサーバーを使ってesaの記事を作成する例です：

```
【Claude】esaに新しい記事を作成してください。タイトルは「プロジェクトXの進捗報告」、本文には「# 今週の進捗\n\n- 機能Aの実装完了\n- 機能Bのテスト開始\n\n## 次週の予定\n\n- 機能Cの実装開始」という内容を含めてください。

【MCP Server】esa_create_post ツールを使用して新しい記事を作成します。

【実行結果】
{
  "number": 123,
  "name": "プロジェクトXの進捗報告",
  "body_md": "# 今週の進捗\n\n- 機能Aの実装完了\n- 機能Bのテスト開始\n\n## 次週の予定\n\n- 機能Cの実装開始",
  "wip": false,
  "created_at": "2023-06-01T12:34:56+09:00",
  "updated_at": "2023-06-01T12:34:56+09:00",
  "url": "https://your-team.esa.io/posts/123"
}

【Claude】記事の作成が完了しました。記事番号は123で、以下のURLからアクセスできます：
https://your-team.esa.io/posts/123
```

## トラブルシューティング

### アクセストークンの問題

```
Error: Request failed with status code 401
```

このエラーが表示される場合、esaのアクセストークンが無効であるか期限切れの可能性があります。esaの設定画面で新しいアクセストークンを発行し、環境変数を更新してください。

### 権限の問題

```
Error: Request failed with status code 403
```

このエラーが表示される場合、現在のアクセストークンに必要な権限がありません。esaの設定画面でアクセストークンの権限を確認し、必要に応じて新しいトークンを発行してください。

## ライセンス

MITライセンスの下で提供されています。
