package migrate

import (
	"github.com/go-pg/migrations/v8"
)

func init() {
	up := []string{
		"ALTER TABLE markdowns RENAME TO info_pages;",
	}

	down := []string{
		"ALTER TABLE info_pages RENAME TO markdowns;",
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
