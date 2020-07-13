package faq

import (
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/sirupsen/logrus"
)

type pgStore struct {
	db *pg.DB
}

func NewFaqStore(db *pg.DB) FaqStore {
	return &pgStore{
		db: db,
	}
}

func (s *pgStore) Get(faqId int) (*Faq, error) {
	u := Faq{ID: faqId}
	err := s.db.Model(&u).Where("discord_id = ?", faqId).Select()
	return &u, err
}

func (s *pgStore) GetAll() ([]*Faq, error) {
	u := []*Faq{}
	err := s.db.Model(&u).Select()
	return u, err
}

func (s *pgStore) Create(faq Faq) error {
	logger := logging.NewLogger()
	logger.Error(faq)
	_, err := s.db.Model(&faq).Insert()
	if err != nil {
		logrus.Error(err)
	}
	return err
}

func (s *pgStore) Update(faq Faq) error {
	err := s.db.Update(&faq)
	return err
}

func (s *pgStore) Delete(faqId int) error {
	u := Faq{ID: faqId}
	err := s.db.Delete(&u)
	return err
}
