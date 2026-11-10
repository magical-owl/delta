FROM postgres:17-alpine

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/01-init.sql

# Ensure secure file permissions
RUN chmod 644 /docker-entrypoint-initdb.d/01-init.sql

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD pg_isready -U ${POSTGRES_USER:-delta} -d ${POSTGRES_DB:-delta} || exit 1
