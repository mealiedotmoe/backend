package rest

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/mealiedotmoe/backend/internal/user"
	"golang.org/x/oauth2"
	"net/http"
)

// AuthResource implements user management handler.
type UserResource struct {
	Users   user.UserStore
	Discord *oauth2.Config
}

// NewUserResource creates and returns a profile resource.
func NewUserResource(store user.UserStore) *UserResource {
	return &UserResource{
		Users: store,
	}
}

func (rs *UserResource) Router() *chi.Mux {
	r := chi.NewRouter()
	r.Get("/me", rs.GetCurrentUser)
	r.Get("/{userId}", rs.GetUser)
	r.With(CheckAdmin).Get("/", rs.GetAllUsers)
	return r
}

func (rs *UserResource) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	token := r.Context().Value("jwt-token").(*jwt.Token)
	userId, ok := token.Claims.(jwt.MapClaims)["sub"].(string)
	if !ok {
		panic("oh shit")
	}
	foundUser, err := rs.Users.Get(userId)
	if err != nil {
		panic(err)
	}
	render.Respond(w, r, foundUser)
}

func (rs *UserResource) GetUser(w http.ResponseWriter, r *http.Request) {
	userId := chi.URLParam(r, "userId")
	if userId == "" {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundUser, err := rs.Users.Get(userId)
	if err != nil {
		panic(err)
	}
	render.Respond(w, r, foundUser)
}

func (rs *UserResource) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	foundUsers, err := rs.Users.GetAll()
	if err != nil {
		panic(err)
	}
	render.Respond(w, r, foundUsers)
}
