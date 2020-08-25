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

func (s *pgStore) Get(slug string) (*InfoPage, error) {
	u := InfoPage{Slug: slug}
	err := s.db.Model(&u).Where("slug = ?", slug).Select()
	return &u, err
}

func (s *pgStore) GetAll(includeHidden bool) ([]*InfoPage, error) {
	u := []*InfoPage{}
	var err error
	if includeHidden {
		err = s.db.Model(&u).Select()
	} else {
		err = s.db.Model(&u).Where("hidden = false").Select()
	}
	return u, err
}

func (s *pgStore) Create(info *InfoPage) error {
	logger := logging.NewLogger()
	logger.Error(info)
	_, err := s.db.Model(info).Insert()
	if err != nil {
		logrus.Error(err)
	}
	return err
}

func (s *pgStore) Update(info *InfoPage) error {
	err := s.db.Update(info)
	return err
}

func (s *pgStore) Delete(slug string) error {
	u := InfoPage{Slug: slug}
	err := s.db.Delete(&u)
	return err
}
