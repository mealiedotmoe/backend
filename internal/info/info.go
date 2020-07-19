package info

import "time"

type InfoPage struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug" pg:",pk"`
	Author    string   `json:"author"`
	LastEdit  string   `json:"last_edit"`
	Content   string   `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// InfoStore defines database operations for InfoPage posts.
type InfoStore interface {
	Get(slug string) (*InfoPage, error)
	GetAll() ([]*InfoPage, error)
	Create(info *InfoPage) error
	Update(info *InfoPage) error
	Delete(slug string) error
}
