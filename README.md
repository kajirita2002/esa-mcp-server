# esa MCP Server

## Overview

This server is an interface that uses the [Model Context Protocol (MCP)](https://github.com/anthropics/anthropic-cookbook/tree/main/model_context_protocol) to enable Claude AI to interact with the [esa API](https://docs.esa.io/posts/102).

With this MCP server, Claude AI can perform operations such as searching, creating, and updating esa documents.

## About the Repository

This repository provides a standalone implementation of the esa MCP server. It integrates Claude AI with esa to streamline document management.

## Setup

### Prerequisites

- Node.js 18 or higher
- esa API access token
- esa team name

### Installation

```bash
# Install required packages
npm install
```

### Setting Environment Variables

```bash
# Set environment variables
export ESA_ACCESS_TOKEN="your_esa_access_token"
export ESA_TEAM="your_team_name"
```

### MCP Configuration Example

If you're using this MCP server add the following configuration to your `mcp_config.json` file:

```json
"esa": {
  "command": "npx",
  "args": ["-y", "--package", "./path/to/esa-mcp-server", "esa-mcp-server"],
  "env": {
    "ESA_ACCESS_TOKEN": "your_esa_access_token",
    "ESA_TEAM": "your_team_name"
  }
}
```

### Starting the Server

```bash
# Start the server
npm start
```

## Available Tools

This MCP server provides the following tools:

### Post Related

1. `esa_list_posts`
   - Get a list of posts in the team
   - Input:
     - `q` (string, optional): Search query
     - `include` (string, optional): Related data to include in the response (e.g. 'comments,stargazers')
     - `sort` (string, optional): Sort method (updated, created, number, stars, watches, comments, best_match)
     - `order` (string, optional): Sort order (desc, asc)
     - `per_page` (number, optional): Number of results per page (max: 100)
     - `page` (number, optional): Page number to retrieve

2. `esa_get_post`
   - Get detailed information about a specific post
   - Input:
     - `post_number` (number, required): Post number to retrieve
     - `include` (string, optional): Related data to include in the response (e.g. 'comments,stargazers')

3. `esa_create_post`
   - Create a new post
   - Input:
     - `name` (string, required): Post title
     - `body_md` (string, optional): Post body (Markdown format)
     - `tags` (array of string, optional): List of tags for the post
     - `category` (string, optional): Post category
     - `wip` (boolean, optional, default: true): Whether to mark as WIP (Work In Progress)
     - `message` (string, optional): Change message
     - `user` (string, optional): Poster's screen_name (only team owners can specify)
     - `template_post_id` (number, optional): ID of the post to use as a template

4. `esa_update_post`
   - Update an existing post
   - Input:
     - `post_number` (number, required): Post number to update
     - `name` (string, optional): New title for the post
     - `body_md` (string, optional): New body for the post (Markdown format)
     - `tags` (array of string, optional): New list of tags for the post
     - `category` (string, optional): New category for the post
     - `wip` (boolean, optional): Whether to mark as WIP (Work In Progress)
     - `message` (string, optional): Change message
     - `created_by` (string, optional): Poster's screen_name (only team owners can specify)
     - `original_revision` (string, optional): Revision to base the update on

5. `esa_delete_post`
   - Delete a post
   - Input:
     - `post_number` (number, required): Post number to delete

### Comment Related

1. `esa_list_comments`
   - Get a list of comments for a post
   - Input:
     - `post_number` (number, required): Post number to get comments for
     - `page` (number, optional): Page number to retrieve
     - `per_page` (number, optional): Number of results per page (max: 100)

2. `esa_get_comment`
   - Get a specific comment
   - Input:
     - `comment_id` (number, required): ID of the comment to retrieve
     - `include` (string, optional): Related data to include in the response (e.g. 'stargazers')

3. `esa_create_comment`
   - Post a comment to an article
   - Input:
     - `post_number` (number, required): Post number to comment on
     - `body_md` (string, required): Comment body (Markdown format)
     - `user` (string, optional): Poster's screen_name (only team owners can specify)

### Member Related

1. `esa_get_members`
   - Get a list of team members
   - Input:
     - `page` (number, optional): Page number to retrieve
     - `per_page` (number, optional): Number of results per page (max: 100)

2. `esa_get_member`
   - Get information about a specific team member
   - Input:
     - `screen_name_or_email` (string, required): Screen name or email of the member to retrieve

## Usage Example

Here's an example of Claude using this MCP server to create an esa post:

```
[Claude] Please create a new post in esa. The title should be "Project X Progress Report" and the body should include "# This Week's Progress\n\n- Implementation of Feature A completed\n- Testing of Feature B started\n\n## Next Week's Plan\n\n- Start implementation of Feature C".

[MCP Server] Using the esa_create_post tool to create a new post.

[Result]
{
  "number": 123,
  "name": "Project X Progress Report",
  "body_md": "# This Week's Progress\n\n- Implementation of Feature A completed\n- Testing of Feature B started\n\n## Next Week's Plan\n\n- Start implementation of Feature C",
  "wip": false,
  "created_at": "2023-06-01T12:34:56+09:00",
  "updated_at": "2023-06-01T12:34:56+09:00",
  "url": "https://your-team.esa.io/posts/123"
}

[Claude] The post has been created successfully. The post number is 123, and you can access it at the following URL:
https://your-team.esa.io/posts/123
```

## Troubleshooting

### Access Token Issues

```
Error: Request failed with status code 401
```

If you see this error, your esa access token may be invalid or expired. Generate a new access token from the esa settings screen and update your environment variable.

### Permission Issues

```
Error: Request failed with status code 403
```

If you see this error, the current access token doesn't have the necessary permissions. Check the permissions for your access token in the esa settings screen and issue a new token if needed.

## License

Provided under the MIT License.
