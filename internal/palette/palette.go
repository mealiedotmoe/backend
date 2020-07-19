package palette

import "time"

type Palette struct {
	ID          int       `json:"id"`
	UserId      string    `json:"user_id"`
	Name        string    `json:"name"`
	Clover      string    `json:"clover"`
	Member      string    `json:"member"`
	Active      string    `json:"active"`
	Regular     string    `json:"regular"`
	Contributor string    `json:"contributor"`
	Addicted    string    `json:"addicted"`
	Insomniac   string    `json:"insomniac"`
	Nolifer     string    `json:"nolifer"`
	Birthday    string    `json:"birthday"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PaletteStore defines database operations for palette's.
type PaletteStore interface {
	Get(paletteId int) (*Palette, error)
	GetByUser(userId string) ([]*Palette, error)
	Create(palette *Palette) error
	Update(palette *Palette) error
	Delete(paletteId int) error
}
