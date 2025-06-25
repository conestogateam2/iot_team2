## Import and Export sql file to Postgres DB

This guide shows how to import Team2_table_export.sql into a Postgres database using Linux bash, and how to export the entire database to a file.

### Prerequisites

- Postgres (version 16 recommended)
- The `Team2_table_export.sql` file
- Access to the target database and user credentials

### Steps to import

### 1: Create the Target Database (If Needed)

If your database does not exist, create it with:

In Linux bash
createdb -U <username> -h <host> -p <port> <database_name>

#### Example:
    createdb -U postgres -h 192.168.0.211 -p 3306 academy06

### 2: Import the SQL file

psql -U <username> -h <host> -p <port> -d <database_name> -f Team2_table_export.sql

#### Example:
    psql -U posgres -h 192.168.0.211 -p 3306 -d academy06 -f Team2_table_export.sql

### 3: Verify the Table

psql -U <username> -h <host> -p <port> -d <database_name>

#### Example:
    psql -U posgres -h 192.168.0.211 -p 3306 -d academy06

### Steps to export

### 1: Export Database from a Postgres DB

pg_dump -h <host> -p <port> -U <username> -d <database_name> -t <table_name> -F p -f <output_file.sql>

#### Example
    pg_dump -h 192.168.0.211 -p 3306 -U postgres -d academy06 -t robot_data_team2 -F p -f Team2_table_export.sql