#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Logging utility that writes to stderr (so it doesn't interfere with MCP protocol on stdout)
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message}`;
  console.error(logMessage);
  if (data) {
    console.error(JSON.stringify(data, null, 2));
  }
};

class TimeServer {
  private server: Server;

  constructor() {
    log('INFO', 'Initializing Time MCP Server');
    
    this.server = new Server(
      {
        name: 'time-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => {
      log('ERROR', 'MCP Server error', error);
      console.error('[MCP Error]', error);
    };
    
    process.on('SIGINT', async () => {
      log('INFO', 'Received SIGINT, shutting down server');
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    log('INFO', 'Setting up tool handlers');
    
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('INFO', 'Received tools/list request');
      
      const tools = {
        tools: [
          {
            name: 'get_current_time',
            description: 'Get the current date and time',
            inputSchema: {
              type: 'object',
              properties: {
                timezone: {
                  type: 'string',
                  description: 'Timezone (optional, defaults to system timezone)',
                  default: 'system'
                },
                format: {
                  type: 'string',
                  description: 'Time format: "12hour", "24hour", or "iso" (default: 12hour)',
                  enum: ['12hour', '24hour', 'iso'],
                  default: '12hour'
                }
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_time_info',
            description: 'Get detailed time information including timezone, day of week, etc.',
            inputSchema: {
              type: 'object',
              properties: {
                timezone: {
                  type: 'string',
                  description: 'Timezone (optional, defaults to system timezone)',
                  default: 'system'
                }
              },
              additionalProperties: false,
            },
          }
        ],
      };
      
      log('INFO', `Returning ${tools.tools.length} available tools`);
      return tools;
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      log('INFO', `Received tool call: ${name}`, args);

      try {
        if (name === 'get_current_time') {
          const timezone = args?.timezone || 'system';
          const format = args?.format || '12hour';
          
          log('INFO', `Getting current time - timezone: ${timezone}, format: ${format}`);
          
          const now = new Date();
          let timeString: string;

          if (timezone !== 'system') {
            // For specific timezone
            const options: Intl.DateTimeFormatOptions = {
              timeZone: timezone as string,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: format === '12hour'
            };
            timeString = now.toLocaleString('en-US', options);
          } else {
            // System timezone
            if (format === 'iso') {
              timeString = now.toISOString();
            } else if (format === '24hour') {
              timeString = now.toLocaleString('en-US', { hour12: false });
            } else {
              timeString = now.toLocaleString('en-US', { hour12: true });
            }
          }

          const result = {
            content: [
              {
                type: 'text',
                text: `Current time: ${timeString}`,
              },
            ],
          };
          
          log('INFO', `Returning time: ${timeString}`);
          return result;
        }

        if (name === 'get_time_info') {
          const timezone = args?.timezone || 'system';
          log('INFO', `Getting detailed time info - timezone: ${timezone}`);
          
          const now = new Date();

          let timeInfo: any = {
            timestamp: now.getTime(),
            iso_string: now.toISOString(),
            local_time: now.toLocaleString(),
            day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' }),
            date: now.toLocaleDateString('en-US'),
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds(),
            timezone_offset: now.getTimezoneOffset(),
          };

          if (timezone !== 'system') {
            try {
              const tzFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone as string,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
              });
              timeInfo.timezone_time = tzFormatter.format(now);
              timeInfo.requested_timezone = timezone;
            } catch (error) {
              timeInfo.timezone_error = `Invalid timezone: ${timezone}`;
            }
          }

          const result = {
            content: [
              {
                type: 'text',
                text: JSON.stringify(timeInfo, null, 2),
              },
            ],
          };
          
          log('INFO', 'Returning detailed time info');
          return result;
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        log('ERROR', `Tool execution failed: ${name}`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log('INFO', 'Time MCP server connected and ready');
    console.error('Time MCP server running on stdio');
  }
}

log('INFO', 'Starting Time MCP Server');
const server = new TimeServer();
server.run().catch((error) => {
  log('ERROR', 'Failed to start server', error);
  console.error(error);
});