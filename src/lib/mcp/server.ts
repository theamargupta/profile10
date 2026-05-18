import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBlogTools } from "./tools/blog";
import { buildLogEntry, logToolCall } from "./telemetry";

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
 * Every tool registration is wrapped with telemetry — fire-and-forget
 * inserts into public.mcp_tool_calls. Twin of the sutra/setu-nextjs wraps
 * so every MCP across the portfolio logs into the same table.
 */
export function createAmarguptaTechMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const originalRegisterTool = server.registerTool.bind(server) as McpServer["registerTool"];
  server.registerTool = ((toolName: string, toolSchema: unknown, handler: unknown) => {
    const wrappedHandler = async (args: unknown, extra: unknown) => {
      const startedAt = Date.now();
      let outcome: "ok" | "error" = "ok";
      let error_short: string | null = null;
      try {
        return await (handler as (a: unknown, e: unknown) => unknown)(args, extra);
      } catch (err) {
        outcome = "error";
        error_short = ((err as Error)?.message ?? String(err)).slice(0, 200);
        throw err;
      } finally {
        try {
          logToolCall(
            buildLogEntry({
              server_name: SERVER_NAME,
              tool_name: toolName,
              args,
              startedAt,
              finishedAt: Date.now(),
              outcome,
              error_short,
            }),
          );
        } catch {
          // Belt-and-braces — logToolCall already swallows.
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalRegisterTool as any)(toolName, toolSchema, wrappedHandler);
  }) as McpServer["registerTool"];

  registerBlogTools(server);
  return server;
}
