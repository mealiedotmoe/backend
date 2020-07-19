package migrate

import (
	"github.com/go-pg/migrations/v8"
)

func init() {
	up := []string{
		"ALTER TABLE palettes RENAME COLUMN palette_name TO name;",
	}

	down := []string{
		"ALTER TABLE palettes RENAME COLUMN name TO palette_name;",
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
