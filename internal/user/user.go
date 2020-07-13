package user

import "time"

type User struct {
	Username     string    `json:"username"`
	DiscordId    string    `json:"discord_id"`
	Birthday     time.Time `json:"birthday"`
	Anilist      string    `json:"anilist"`
	Waifu        string    `json:"waifu"`
	DiscordToken string    `json:"discord_token"`
	Experience   int       `json:"experience"`
	Level        int       `json:"level"`
	Admin        bool      `json:"admin"`
}

// UserStore defines database operations for a user.
type UserStore interface {
	Get(userId string) (*User, error)
	GetAll() ([]*User, error)
	Create(user User) error
	Update(user User) error
	Delete(userId string) error
}
