package migrate

import (
	"github.com/go-pg/migrations/v8"
)

const addTags = `
ALTER TABLE faqs
ADD COLUMN IF NOT EXISTS tag TEXT,
ADD COLUMN IF NOT EXISTS color TEXT;
`

const remTags = `
ALTER TABLE faqs
DROP COLUMN tag,
DROP COLUMN color;
`

func init() {
	up := []string{
		addTags,
	}

	down := []string{
		remTags,
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
