# Backend API for mealie.moe

How to set up environment:

## Download and install Postgres 11

`brew install postgresql`
https://formulae.brew.sh/formula/postgresql

Once Postgres is installed and running, get into the shell by running `psql postgres`
```sql
CREATE DATABASE mealiedb;
CREATE USER mealie WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mealiedb TO mealie;
```

## Download and install Go

`brew install Go`
https://formulae.brew.sh/formula/go

## Clone and Run

After cloning the repository, copy the example config and insert your own values

`cp example-config.yaml config.yaml`

Build the application

`go build`

Run migrations

`./backend migrate init`

`./backend migrate up`

Serve

`./backend serve`


