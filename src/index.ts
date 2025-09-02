#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class TimeServer {
  private server: Server;

  constructor() {
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
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
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
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'get_current_time') {
          const timezone = args?.timezone || 'system';
          const format = args?.format || '12hour';
          
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

          return {
            content: [
              {
                type: 'text',
                text: `Current time: ${timeString}`,
              },
            ],
          };
        }

        if (name === 'get_time_info') {
          const timezone = args?.timezone || 'system';
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

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(timeInfo, null, 2),
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
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
    console.error('Time MCP server running on stdio');
  }
}

const server = new TimeServer();
server.run().catch(console.error);