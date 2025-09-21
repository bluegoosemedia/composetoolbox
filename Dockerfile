FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps


# Copy source code and public assets
COPY . .
COPY public ./public

# Build the application
RUN npm run build

# Production image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy initialization script
COPY --chown=nextjs:nodejs scripts/init-data.sh ./scripts/
COPY --chown=nextjs:nodejs scripts/entrypoint.sh ./scripts/
RUN chmod +x ./scripts/init-data.sh ./scripts/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the entrypoint script instead of direct node command
CMD ["./scripts/entrypoint.sh"]
