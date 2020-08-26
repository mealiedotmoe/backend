package migrate

import (
	"github.com/go-pg/migrations/v8"
)

func init() {
	up := []string{
		"ALTER TABLE info_pages ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE",
	}

	down := []string{
		"ALTER TABLE palettes DROP COLUMN hidden;",
	}

	_ = migrations.Register(func(db migrations.DB) error {
		for _, q := range up {
			_, err := db.Exec(q)
			if err != nil {
				return err
			}
		}
		return nil
	}, func(db migrations.DB) error {
		for _, q := range down {
			_, err := db.Exec(q)
			if err != nil {
				return err
			}
		}
		return nil
	})
}
