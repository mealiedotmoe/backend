package user

import "time"

type User struct {
	Username     string    `json:"username" pg:",use_zero"`
	DiscordId    string    `json:"discord_id" pg:",pk,use_zero"`
	Birthday     time.Time `json:"birthday"`
	Anilist      string    `json:"anilist"`
	Waifu        string    `json:"waifu"`
	Admin        bool      `json:"admin" pg:",use_zero"`
}

// UserStore defines database operations for a user.
type UserStore interface {
	Get(userId string) (*User, error)
	GetAll() ([]*User, error)
	Create(user User) error
	Update(user User) error
	Delete(userId string) error
}
