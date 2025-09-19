FROM node:18-slim

# Install required system dependencies for Prisma
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client with correct binary target for Debian
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
RUN npx prisma generate

# Build the application
RUN npm run build

# Create startup script
RUN printf '#!/bin/sh\necho "Waiting for database..."\nsleep 10\necho "Setting up database schema..."\nnpx prisma db push --force-reset\necho "Starting application..."\nnpm run start:prod\n' > start.sh && chmod +x start.sh

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "./start.sh"]