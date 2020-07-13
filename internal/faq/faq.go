package faq

type Faq struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Author   string `json:"author"`
	LastEdit string `json:"last_edit"`
	Content  string `json:"content"`
}

// FaqStore defines database operations for faq's.
type FaqStore interface {
	Get(faqId int) (*Faq, error)
	GetAll() ([]*Faq, error)
	Create(faq Faq) error
	Update(faq Faq) error
	Delete(faqId int) error
}
