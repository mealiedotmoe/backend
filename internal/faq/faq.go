package faq

import "time"

type Faq struct {
	ID        int      `json:"id" pg:",pk"`
	Title     string   `json:"title"`
	Author    string   `json:"author"`
	LastEdit  string   `json:"last_edit"`
	Content   string   `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// FaqStore defines database operations for faq's.
type FaqStore interface {
	Get(faqId int) (*Faq, error)
	GetAll() ([]*Faq, error)
	Create(faq *Faq) error
	Update(faq *Faq) error
	Delete(faqId int) error
}
