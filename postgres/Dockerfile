FROM postgres:15

RUN apt-get update \
    && apt-get install -y \
        postgresql-server-dev-15 \
        postgresql-15-pgvector \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* 