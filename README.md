# Time MCP Server

A Model Context Protocol (MCP) server that provides time and date information for AI assistants like Claude in VSCode.

## Features

- **Current Time**: Get the current time in various formats
- **Timezone Support**: Query time in different timezones
- **Detailed Info**: Get comprehensive time information including day of week, timestamp, etc.
- **Multiple Formats**: Support for 12-hour, 24-hour, and ISO formats

## Available Tools

### `get_current_time`
Get the current date and time with formatting options.

**Parameters:**
- `timezone` (optional): Timezone identifier (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")
- `format` (optional): Time format - "12hour" (default), "24hour", or "iso"

**Examples:**
- "What time is it?"
- "Get current time in Tokyo"
- "Show me the time in 24-hour format"

### `get_time_info` 
Get detailed time information including timezone data, day of week, and timestamps.

**Parameters:**
- `timezone` (optional): Timezone identifier

**Examples:**
- "Give me detailed time information"
- "Show time info for London timezone"

## Installation

1. **Clone or create the project:**
   ```bash
   mkdir time-mcp-server
   cd time-mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Configuration

### For Claude in VSCode

Create an `mcp.json` file in your project or workspace:

```json
{
  "servers": {
    "time-server": {
      "command": "node",
      "args": ["/absolute/path/to/time-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

**Important:** Replace `/absolute/path/to/time-mcp-server/` with the actual absolute path to your project directory.

### Example Configuration
```json
{
  "servers": {
    "time-server": {
      "command": "node",
      "args": ["/Users/username/projects/time-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

## Usage

Once configured with Claude in VSCode, you can ask natural language questions:

- **"What time is it?"** → Returns current time
- **"What time is it in New York?"** → Returns time in EST/EDT
- **"Show me the time in 24-hour format"** → Returns time in 24-hour format
- **"Get detailed time information"** → Returns comprehensive time data
- **"What day is today?"** → Uses detailed info to show current day

## Development

### Project Structure
```
time-mcp-server/
├── src/
│   └── index.ts          # Main server code
├── dist/                 # Built JavaScript (generated)
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Scripts
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Build and run the server
- `npm start` - Run the built server

### Testing
You can test the server directly:
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

## Supported Timezones

The server supports any valid IANA timezone identifier, including:
- `America/New_York`
- `Europe/London` 
- `Asia/Tokyo`
- `Australia/Sydney`
- `UTC`

## Dependencies

- `@modelcontextprotocol/sdk` - Official MCP SDK
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test: `npm run build`
5. Submit a pull request

## Troubleshooting

### Common Issues

**"No inputs were found" error:**
- Ensure the `src/index.ts` file exists
- Run `npm run build` after creating the file

**Server not responding:**
- Check that the path in `mcp.json` is absolute and correct
- Verify the server was built successfully (`dist/index.js` exists)
- Restart VSCode after configuration changes

**TypeScript errors:**
- Make sure all dependencies are installed: `npm install`
- Check TypeScript version compatibility

### Debug Mode
Add console logging by setting environment variables:
```json
{
  "servers": {
    "time-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "DEBUG": "true"
      }
    }
  }
}
```

## Version History

- **0.1.0** - Initial release with basic time functionality