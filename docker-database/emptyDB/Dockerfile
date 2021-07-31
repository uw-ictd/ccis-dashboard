FROM postgres:13-alpine
# Build context is one directory up (docker-database/) so these paths are relative to that
ADD sql/schema.sql     /docker-entrypoint-initdb.d/
ADD sql/userTester.sql /docker-entrypoint-initdb.d/
