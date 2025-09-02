# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Install dev dependencies and build
RUN npm install typescript @types/node && \
    npm run build && \
    npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp

# Change ownership of app directory
RUN chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose stdio (though MCP typically uses stdin/stdout)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js | grep -q "get_current_time" || exit 1

# Start the MCP server
CMD ["node", "dist/index.js"]