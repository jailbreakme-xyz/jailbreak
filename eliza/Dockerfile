# Use a specific Node.js version for better reproducibility
FROM node:23.3.0-slim AS builder

# Install pnpm globally and install necessary build tools
RUN npm install -g pnpm@9.15.1 
RUN apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /usr/src/app/eliza

# Copy package.json and other configuration files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy the rest of the application code
COPY ./src ./src
COPY ./characters ./characters
COPY ./.env ./

# Install dependencies and build the project
RUN pnpm i
RUN pnpm build 
# Create a new stage for the final image
FROM node:23.3.0-slim

# Install runtime dependencies if needed
RUN npm install -g pnpm@9.15.1
RUN apt-get update && \
    apt-get install -y git python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app/eliza

# Copy built artifacts and production dependencies from the builder stage
COPY --from=builder /usr/src/app/eliza/package.json /usr/src/app/eliza/
COPY --from=builder /usr/src/app/eliza/node_modules /usr/src/app/eliza/node_modules
COPY --from=builder /usr/src/app/eliza/src /usr/src/app/eliza/src
COPY --from=builder /usr/src/app/eliza/characters /usr/src/app/eliza/characters
COPY --from=builder /usr/src/app/eliza/.env /usr/src/app/eliza/
COPY --from=builder /usr/src/app/eliza/dist /usr/src/app/eliza/dist
COPY --from=builder /usr/src/app/eliza/tsconfig.json /usr/src/app/eliza/
COPY --from=builder /usr/src/app/eliza/pnpm-lock.yaml /usr/src/app/eliza/

EXPOSE 3030
# Set the command to run the application
CMD ["pnpm", "start"]
# CMD ["node", "dist/index.js"]