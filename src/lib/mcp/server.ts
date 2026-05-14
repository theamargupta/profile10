import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBlogTools } from "./tools/blog";

const SERVER_NAME = "amargupta-tech";
const SERVER_VERSION = "0.1.0";

/**
 * MCP server factory for amargupta.tech. Stateless — a new server is
 * constructed per /api/mcp request.
 *
 * Current surface (7 tools):
 *   - blog_list_posts
 *   - blog_get_post
 *   - blog_create_post
 *   - blog_update_post
 *   - blog_publish_post
 *   - blog_list_tags
 *   - blog_attach_tags_to_post
 *
 * Future surface: project_* tools (create / update a portfolio project),
 * experience_* tools, contact_submissions reads. Add by registering more
 * tool files alongside ./tools/blog.ts.
 */
export function createAmarguptaTechMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });
  registerBlogTools(server);
  return server;
}
