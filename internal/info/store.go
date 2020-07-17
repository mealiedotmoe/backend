package info

import (
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/sirupsen/logrus"
)

type pgStore struct {
	db *pg.DB
}

func NewInfoStore(db *pg.DB) InfoStore {
	return &pgStore{
		db: db,
	}
}

func (s *pgStore) Get(slug string) (*Info, error) {
	u := Info{Slug: slug}
	err := s.db.Model(&u).Where("slug = ?", slug).Select()
	return &u, err
}

func (s *pgStore) GetAll() ([]*Info, error) {
	u := []*Info{}
	err := s.db.Model(&u).Select()
	return u, err
}

func (s *pgStore) Create(info *Info) error {
	logger := logging.NewLogger()
	logger.Error(info)
	_, err := s.db.Model(info).Insert()
	if err != nil {
		logrus.Error(err)
	}
	return err
}

func (s *pgStore) Update(info *Info) error {
	err := s.db.Update(info)
	return err
}

func (s *pgStore) Delete(slug string) error {
	u := Info{Slug: slug}
	err := s.db.Delete(&u)
	return err
}
