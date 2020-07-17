package info

import "time"

type Info struct {
	// TODO: Fix table name
	tableName struct{} `pg:"markdowns"`
	Title    string    `json:"title"`
	Slug     string    `json:"slug" pg:",pk"`
	Author   string    `json:"author"`
	LastEdit string `json:"last_edit"`
	Content  string    `json:"content"`
	// TODO: Fix column name
	CreatedAt time.Time `json:"created_at" pg:"createdAt"`
	UpdatedAt time.Time `json:"updated_at" pg:"updatedAt"`
}

// InfoStore defines database operations for Info posts.
type InfoStore interface {
	Get(slug string) (*Info, error)
	GetAll() ([]*Info, error)
	Create(info *Info) error
	Update(info *Info) error
	Delete(slug string) error
}
