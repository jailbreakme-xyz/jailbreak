FROM node:23.3.0-slim

RUN npm install -g pnpm@9.4.0 && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      git python3 make g++ \
      libnss3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libexpat1 \
      libfontconfig1 \
      libgbm1 \
      libgtk-3-0 \
      libasound2 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libxshmfence1 \
      libxext6 \
      libxrender1 \
      libxtst6 \
      libwayland-client0 \
      libwayland-cursor0 \
      libwayland-egl1 \
      libpango-1.0-0 \
      libx11-6 \
      libxcb1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app/eliza

COPY package.json pnpm-lock.yaml ./

ENV npm_config_build_from_source=true

RUN pnpm install --frozen-lockfile

RUN pnpm exec playwright install --with-deps chromium

COPY . .

EXPOSE 3030
CMD ["pnpm", "start"]
