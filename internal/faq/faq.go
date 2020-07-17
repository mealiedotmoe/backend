package faq

import "time"

type Faq struct {
	// TODO: Fix table name
	tableName struct{} `pg:"faqinfos"`
	ID        int      `json:"id" pg:",pk"`
	Title     string   `json:"title"`
	Author    string   `json:"author"`
	LastEdit  string   `json:"last_edit"`
	Content   string   `json:"content"`
	// TODO: Fix column name
	CreatedAt time.Time `json:"created_at" pg:"createdAt"`
	UpdatedAt time.Time `json:"updated_at" pg:"updatedAt"`
}

// FaqStore defines database operations for faq's.
type FaqStore interface {
	Get(faqId int) (*Faq, error)
	GetAll() ([]*Faq, error)
	Create(faq *Faq) error
	Update(faq *Faq) error
	Delete(faqId int) error
}
