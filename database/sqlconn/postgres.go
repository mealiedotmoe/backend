package sqlconn

import (
	"context"
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/spf13/viper"
	"log"
	"time"
)

func DBConn() (*pg.DB, error) {
	logs := logging.NewLogger()
	opts, err := pg.ParseURL(viper.GetString("database_url"))
	if err != nil {
		return nil, err
	}

	db := pg.Connect(opts)
	if err := checkConn(db); err != nil {
		connErr := retry(logs, time.Second*5, time.Second*60, func() error {
			db = pg.Connect(opts)
			err = checkConn(db)
			return err
		})
		if connErr != nil {
			return nil, connErr
		}
	}

	if viper.GetBool("db_debug") {
		db.AddQueryHook(&logSQL{})
	}

	return db, nil
}

type logSQL struct{}

func (l *logSQL) BeforeQuery(ctx context.Context, qe *pg.QueryEvent) (context.Context, error) {
	return ctx, nil
}

func (l *logSQL) AfterQuery(ctx context.Context, e *pg.QueryEvent) error {
	query, err := e.FormattedQuery()
	if err != nil {
		panic(err)
	}
	log.Println(string(query))
	return nil
}

func checkConn(db *pg.DB) error {
	var n int
	_, err := db.QueryOne(pg.Scan(&n), "SELECT 1")
	return err
}
