package info

import "time"

type Info struct {
	Title    string    `json:"title"`
	Slug     string    `json:"slug"`
	Author   string    `json:"author"`
	LastEdit time.Time `json:"last_edit"`
	Content  string    `json:"content"`
}

// InfoStore defines database operations for Info posts.
type InfoStore interface {
	Get(slug string) (*Info, error)
	GetAll() ([]*Info, error)
	Create(info Info) error
	Update(info Info) error
	Delete(slug string) error
}
