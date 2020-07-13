package palette

import (
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/sirupsen/logrus"
)

type pgStore struct {
	db *pg.DB
}

func NewPaletteStore(db *pg.DB) PaletteStore {
	return &pgStore{
		db: db,
	}
}

func (s *pgStore) Get(paletteId int) (*Palette, error) {
	u := Palette{ID: paletteId}
	err := s.db.Model(&u).Where("discord_id = ?", paletteId).Select()
	return &u, err
}

func (s *pgStore) GetAll() ([]*Palette, error) {
	u := []*Palette{}
	err := s.db.Model(&u).Select()
	return u, err
}

func (s *pgStore) Create(palette Palette) error {
	logger := logging.NewLogger()
	logger.Error(palette)
	_, err := s.db.Model(&palette).Insert()
	if err != nil {
		logrus.Error(err)
	}
	return err
}

func (s *pgStore) Update(palette Palette) error {
	err := s.db.Update(&palette)
	return err
}

func (s *pgStore) Delete(paletteId int) error {
	u := Palette{ID: paletteId}
	err := s.db.Delete(&u)
	return err
}
