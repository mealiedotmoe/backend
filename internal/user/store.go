package user

import (
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/sirupsen/logrus"
)

type pgStore struct {
	db *pg.DB
}

func NewUserStore(db *pg.DB) UserStore {
	return &pgStore{
		db: db,
	}
}

func (s *pgStore) Get(userId string) (*User, error) {
	u := User{DiscordId: userId}
	err := s.db.Model(&u).Where("discord_id = ?", userId).Select()
	return &u, err
}

func (s *pgStore) GetAll() ([]*User, error) {
	u := []*User{}
	err := s.db.Model(&u).Select()
	return u, err
}

func (s *pgStore) Create(user User) error {
	logger := logging.NewLogger()
	logger.Error(user)
	_, err := s.db.Model(&user).Insert()
	if err != nil {
		logrus.Error(err)
	}
	return err
}

func (s *pgStore) Update(user User) error {
	err := s.db.Update(&user)
	return err
}

func (s *pgStore) Delete(userId string) error {
	u := User{DiscordId: userId}
	err := s.db.Delete(&u)
	return err
}
