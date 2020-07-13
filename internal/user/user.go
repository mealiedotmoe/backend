package user

import "time"

type User struct {
	Username     string    `json:"username" pg:",notnull"`
	DiscordId    string    `json:"discord_id" pg:",pk,notnull"`
	Birthday     time.Time `json:"birthday"`
	Anilist      string    `json:"anilist"`
	Waifu        string    `json:"waifu"`
	DiscordToken string    `json:"discord_token" pg:",notnull"`
	Experience   int       `json:"experience" pg:",notnull"`
	Level        int       `json:"level" pg:",notnull"`
	Admin        bool      `json:"admin" pg:",notnull"`
}

// UserStore defines database operations for a user.
type UserStore interface {
	Get(userId string) (*User, error)
	GetAll() ([]*User, error)
	Create(user User) error
	Update(user User) error
	Delete(userId string) error
}
