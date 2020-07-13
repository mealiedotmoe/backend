package palette

import "time"

type Palette struct {
	ID          int
	UserId      string
	PaletteName string
	Clover      string
	Member      string
	Active      string
	Regular     string
	Contributor string
	Addicted    string
	Insomniac   string
	Nolifer     string
	Birthday    string
	CreatedAt   time.Time
}

// PaletteStore defines database operations for palette's.
type PaletteStore interface {
	Get(paletteId int) (*Palette, error)
	GetAll() ([]*Palette, error)
	Create(palette Palette) error
	Update(palette Palette) error
	Delete(paletteId int) error
}