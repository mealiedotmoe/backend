package migrate

import (
"github.com/go-pg/migrations/v8"
)

const cleanup = `
ALTER TABLE USERS
DROP COLUMN discord_token,
DROP COLUMN experience,
DROP COLUMN level;
`

const clutter = `
ALTER TABLE USERS
ADD COLUMN discord_token character varying(255),
ADD COLUMN experience integer DEFAULT 0 NOT NULL,
ADD COLUMN level integer DEFAULT 0 NOT NULL;
`

func init() {
	up := []string{
		cleanup,
	}

	down := []string{
		clutter,
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
