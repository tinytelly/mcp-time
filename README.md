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

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** 
- **Docker Desktop** (for Docker builds)
  - Install via: `brew install --cask docker` 
  - Or download from https://www.docker.com/products/docker-desktop/
  - **Important**: You need Docker Desktop (full app), not just Docker CLI

## Installation

### Local Development

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

### Docker Deployment

**Prerequisites**: Ensure Docker Desktop is running
```bash
# Check Docker is running
docker ps

# If not running, start Docker Desktop
open -a Docker  # or open -a "Docker Desktop"
```

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Or build manually:**
   ```bash
   docker build -t time-mcp-server .
   docker run -d --name time-mcp-server time-mcp-server
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f time-mcp-server
   ```

## Configuration

## Configuration

### Local Development - Claude in VSCode

For local Node.js execution:
```json
{
  "servers": {
    "time-server": {
      "command": "node",
      "args": ["/Users/user/Desktop/code/mcp/time/dist/index.js"],
      "env": {}
    }
  }
}
```

### Docker Deployment - Claude in VSCode

#### Option 1: Docker Exec (Recommended)
For a running Docker container:
```json
{
  "servers": {
    "time-server": {
      "command": "docker",
      "args": ["exec", "-i", "time-mcp-server", "node", "dist/index.js"],
      "env": {}
    }
  }
}
```

#### Option 2: Docker Run (Creates new container each time)
```json
{
  "servers": {
    "time-server": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "time-mcp-server"],
      "env": {}
    }
  }
}
```

#### Option 3: Docker Compose Integration
If using docker-compose, first start the service:
```bash
docker-compose up -d
```

Then use Option 1 configuration above.

### Configuration Steps for Docker

1. **Start your Docker container:**
   ```bash
   docker-compose up -d
   # OR
   docker run -d --name time-mcp-server time-mcp-server
   ```

2. **Update mcp.json** with Docker exec configuration (Option 1 above)

3. **Restart VSCode** to reload MCP configuration

4. **Test with Claude:** Ask "What time is it?"

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

### Local Development Scripts
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Build and run the server (for MCP clients)
- `npm start` - Run the built server (for MCP clients)
- `npm test` - Quick test to verify server is working

### Testing

**Quick Test:**
```bash
npm test
```

**Manual Testing:**
```bash
# Test tool listing
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js

# Test getting current time
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_current_time", "arguments": {}}}' | node dist/index.js
```

**Note:** `npm start` and `npm run dev` will appear to "hang" - this is normal! The server is waiting for MCP protocol messages on stdin. Use the test commands above or configure with Claude to interact with it.

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

**Docker not working:**
- Ensure Docker Desktop is installed and running: `brew install --cask docker`
- Start Docker Desktop: `open -a Docker` (wait for whale icon in menu bar)
- Verify with: `docker ps` (should not show connection errors)
- Docker Desktop takes 30-60 seconds to fully start after launching

**Server appears to hang:**
- This is normal behavior! The server waits for MCP protocol messages on stdin
- Use `npm test` for quick verification, or configure with Claude for actual usage
- The server only responds when it receives proper JSON-RPC messages

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