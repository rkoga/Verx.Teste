-- Create databases for each service
CREATE DATABASE transactions;
CREATE DATABASE consolidation;
CREATE DATABASE reporting;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE transactions TO cashflow;
GRANT ALL PRIVILEGES ON DATABASE consolidation TO cashflow;
GRANT ALL PRIVILEGES ON DATABASE reporting TO cashflow;

-- Connect to transactions database and create extensions
\c transactions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Connect to consolidation database and create extensions
\c consolidation;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Connect to reporting database and create extensions
\c reporting;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Made with Bob
