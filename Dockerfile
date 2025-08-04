# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all deps (including dev)
RUN npm install

# Copy the rest of the app
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies to shrink the image
RUN npm prune --omit=dev

# Set NODE_ENV to production (optional but recommended)
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 4000

# Start the compiled app (adjust if your entry point is different)
CMD ["node", "dist/index.js"]
