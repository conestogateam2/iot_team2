## Import/Export sql file in/to Postgres DB

This guide explains how to import the `Team2_table_export.sql` table dump into your PostgreSQL database with Linux bash

### Prerequisites

- PostgreSQL (version 16 recommended)
- The `Team2_table_export.sql` file
- Access to the target database and user credentials

### Steps

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

### 4: Export Database from an Postgres DB

#### Example
    pg_dump -h 192.168.0.211 -p 3306 -U postgres -d academy06 -t robot_data_team2 -F p -f Team2_table_export.sql