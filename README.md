# Backend API for mealie.moe

How to set up a dev environment:

## Docker

If you have docker installed on your system, you can simply run `docker-compose up` to get a working instance of the
latest stable docker image running and listening on `localhost:8810`

To pull the latest image you can simply run these three commands:
```
docker-compose down
docker rmi dashwav/mealiebackend:stable 
docker-compose up
```

NOTE: You will still need a config file setup in your current directory with discord and website env vars

## Manual (recommended for development)

### Download and install Postgres 11

`brew install postgresql`
https://formulae.brew.sh/formula/postgresql

Once Postgres is installed and running, get into the shell by running `psql postgres`
```sql
CREATE DATABASE mealiedb;
CREATE USER mealie WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mealiedb TO mealie;
```

### Download and install Go

`brew install Go`
https://formulae.brew.sh/formula/go

### Config

After cloning the repository, copy the example config and insert your own values

`cp example-config.yaml config.yaml`

### Build and Run

Build the application

`go build`

Run migrations

`./backend migrate init`

`./backend migrate up`

Serve

`./backend serve`


