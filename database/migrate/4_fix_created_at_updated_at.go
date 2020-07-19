package migrate

import (
	"github.com/go-pg/migrations/v8"
)

const genres = `
ALTER TABLE genres
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE genres
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE genres
RENAME COLUMN "updatedAt" to updated_at;
`

const choices = `
ALTER TABLE choices
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE choices
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE choices
RENAME COLUMN "updatedAt" to updated_at;
`

const games = `
ALTER TABLE games
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE games
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE games
RENAME COLUMN "updatedAt" to updated_at;
`

const votes = `
ALTER TABLE votes
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE votes
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE votes
RENAME COLUMN "updatedAt" to updated_at;
`
const channels = `
ALTER TABLE channels
DROP COLUMN created_at,
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE channels
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE channels
RENAME COLUMN "updatedAt" to updated_at;
`

const faqs = `
ALTER TABLE faqs
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE faqs
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE faqs
RENAME COLUMN "updatedAt" to updated_at;
`

const infoPages = `
ALTER TABLE info_pages
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE info_pages
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE info_pages
RENAME COLUMN "updatedAt" to updated_at;
`

const subscriptions = `
ALTER TABLE subscriptions
DROP COLUMN created_at,
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE subscriptions
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE subscriptions
RENAME COLUMN "updatedAt" to updated_at;
`

const events = `
ALTER TABLE events
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE events
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE events
RENAME COLUMN "updatedAt" to updated_at;
`

const questions = `
ALTER TABLE questions
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE questions
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE questions
RENAME COLUMN "updatedAt" to updated_at;
`

const messages = `
ALTER TABLE messages
DROP COLUMN created_at,
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE messages
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE messages
RENAME COLUMN "updatedAt" to updated_at;
`

const palettes = `
ALTER TABLE palettes
DROP COLUMN created_at,
ALTER COLUMN "createdAt" SET not null,
ALTER COLUMN "createdAt" SET default current_timestamp,
ALTER COLUMN "updatedAt" SET not null,
ALTER COLUMN "updatedAt" SET default current_timestamp;
ALTER TABLE palettes
RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE palettes
RENAME COLUMN "updatedAt" to updated_at;
`

const downgenres = `
ALTER TABLE genres
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE genres RENAME COLUMN created_at TO "createdAt";
ALTER TABLE genres RENAME COLUMN updated_at TO "updatedAt";
`

const downchoices = `
ALTER TABLE choices
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE choices RENAME COLUMN created_at TO "createdAt";
ALTER TABLE choices RENAME COLUMN updated_at TO "updatedAt";
`

const downgames = `
ALTER TABLE games
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE games RENAME COLUMN created_at TO "createdAt";
ALTER TABLE games RENAME COLUMN updated_at TO "updatedAt";
`

const downvotes = `
ALTER TABLE votes
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE votes RENAME COLUMN created_at TO "createdAt";
ALTER TABLE votes RENAME COLUMN updated_at TO "updatedAt";
`
const downchannels = `
ALTER TABLE channels
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE channels RENAME COLUMN created_at TO "createdAt";
ALTER TABLE channels RENAME COLUMN updated_at TO "updatedAt";
`

const downfaqs = `
ALTER TABLE faqs
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE faqs RENAME COLUMN created_at TO "createdAt";
ALTER TABLE faqs RENAME COLUMN updated_at TO "updatedAt";
`

const downinfoPages = `
ALTER TABLE info_pages
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE info_pages RENAME COLUMN created_at TO "createdAt";
ALTER TABLE info_pages RENAME COLUMN updated_at TO "updatedAt";
`

const downsubscriptions = `
ALTER TABLE subscriptions
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE subscriptions RENAME COLUMN created_at TO "createdAt";
ALTER TABLE subscriptions RENAME COLUMN updated_at TO "updatedAt";
`

const downevents = `
ALTER TABLE events
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE events RENAME COLUMN created_at TO "createdAt";
ALTER TABLE events RENAME COLUMN updated_at TO "updatedAt";
`

const downquestions = `
ALTER TABLE questions
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE questions RENAME COLUMN created_at TO "createdAt";
ALTER TABLE questions RENAME COLUMN updated_at TO "updatedAt";
`

const downmessages = `
ALTER TABLE messages
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE messages RENAME COLUMN created_at TO "createdAt";
ALTER TABLE messages RENAME COLUMN updated_at TO "updatedAt";
`

const downpalettes = `
ALTER TABLE palettes
ALTER COLUMN created_at DROP DEFAULT,
ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE messages RENAME COLUMN created_at TO "createdAt";
ALTER TABLE messages RENAME COLUMN updated_at TO "updatedAt";
`

func init() {
	up := []string{
		genres,
		choices,
		games,
		votes,
		channels,
		faqs,
		infoPages,
		subscriptions,
		events,
		questions,
		messages,
		palettes,
	}

	down := []string{
		downgenres,
		downchoices,
		downgames,
		downvotes,
		downchannels,
		downfaqs,
		downinfoPages,
		downsubscriptions,
		downevents,
		downquestions,
		downmessages,
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
