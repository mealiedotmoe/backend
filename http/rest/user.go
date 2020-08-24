package rest

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/mealiedotmoe/backend/internal/user"
	"github.com/mealiedotmoe/backend/logging"
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
	r.With(VerifyAuthToken).Get("/me", rs.GetCurrentUser)
	r.Get("/{userId}", rs.GetUser)
	r.With(VerifyAuthToken, CheckAdmin).Get("/", rs.GetAllUsers)
	return r
}

func (rs *UserResource) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	logger := logging.NewLogger()
	token := r.Context().Value("jwt-token").(*jwt.Token)
	userId, ok := token.Claims.(jwt.MapClaims)["sub"].(string)
	if !ok {
		logger.Error("Error getting claims for user: no sub in token")
		http.Error(w, http.StatusText(409), 409)
		return
	}
	foundUser, err := rs.Users.Get(userId)
	if err != nil {
		logger.Errorf("Error finding user (id: %v): %s", userId, err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundUser)
}

func (rs *UserResource) GetUser(w http.ResponseWriter, r *http.Request) {
	logger := logging.NewLogger()
	userId := chi.URLParam(r, "userId")
	if userId == "" {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundUser, err := rs.Users.Get(userId)
	if err != nil {
		logger.Errorf("Error finding user (id: %v): %s", userId, err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundUser)
}

func (rs *UserResource) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	logger := logging.NewLogger()
	foundUsers, err := rs.Users.GetAll()
	if err != nil {
		logger.Errorf("Error finding users: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundUsers)
}
