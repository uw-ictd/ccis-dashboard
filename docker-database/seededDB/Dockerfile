FROM postgres:13-alpine
# Build context is one directory up (docker-database/) so these paths are relative to that
ADD sql/schema.sql         /docker-entrypoint-initdb.d/
ADD sql/userDashboard.sql  /docker-entrypoint-initdb.d/
ADD sql/seedMainTables.sql /docker-entrypoint-initdb.d/
