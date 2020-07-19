package rest

import (
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/internal/info"
	"net/http"
	"time"
)

// AuthResource implements info management handler.
type InfoResource struct {
	Infos info.InfoStore
}

// NewInfoResource creates and returns a profile resource.
func NewInfoResource(store info.InfoStore) *InfoResource {
	return &InfoResource{
		Infos: store,
	}
}

func (rs *InfoResource) Router() *chi.Mux {
	r := chi.NewRouter()
	r.Get("/", rs.GetAllInfoPages)
	r.With(VerifyAuthToken, CheckAdmin).Post("/", rs.CreateInfoPage)
	r.With(VerifyAuthToken, CheckAdmin).Put("/{infoSlug}", rs.UpdateInfoPage)
	r.Get("/{infoSlug}", rs.GetInfoPage)
	return r
}

func (rs *InfoResource) GetInfoPage(w http.ResponseWriter, r *http.Request) {
	infoSlug := chi.URLParam(r, "infoSlug")
	foundInfo, err := rs.Infos.Get(infoSlug)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundInfo)
}

type InfoPageRequest struct {
	Title   string `json:"title"`
	Slug    string `json:"slug"`
	Content string `json:"content"`
}

func (rs *InfoResource) CreateInfoPage(w http.ResponseWriter, r *http.Request) {
	infoRequest := &InfoPageRequest{}
	err := json.NewDecoder(r.Body).Decode(infoRequest)
	if err != nil {
		http.Error(w, http.StatusText(422), 422)
		return
	}
	token, err := extractToken(r.Context())
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	authorId, ok := token.Claims.(jwt.MapClaims)["sub"].(string)
	if !ok {
		http.Error(w, http.StatusText(403), 403)
		return
	}
	newInfo := &info.InfoPage{
		Title:     infoRequest.Title,
		Author:    authorId,
		LastEdit:  authorId,
		Content:   infoRequest.Content,
		Slug:      infoRequest.Slug,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = rs.Infos.Create(newInfo)
	if err != nil {
		pgErr, ok := err.(pg.Error)
		if ok && pgErr.IntegrityViolation() {
			http.Error(w, http.StatusText(409), 409)
			return
		} else {
			panic(err)
		}
	}
	render.Respond(w, r, newInfo)
}

func (rs *InfoResource) UpdateInfoPage(w http.ResponseWriter, r *http.Request) {
	infoSlug := chi.URLParam(r, "infoSlug")
	foundInfo, err := rs.Infos.Get(infoSlug)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
		return
	}

	infoRequest := &InfoPageRequest{}
	err = json.NewDecoder(r.Body).Decode(infoRequest)
	if err != nil {
		http.Error(w, http.StatusText(422), 422)
		return
	}
	token, err := extractToken(r.Context())
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	authorId, ok := token.Claims.(jwt.MapClaims)["sub"].(string)
	if !ok {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	foundInfo.Content = infoRequest.Content
	foundInfo.Title = infoRequest.Title
	foundInfo.LastEdit = authorId
	foundInfo.UpdatedAt = time.Now()
	err = rs.Infos.Update(foundInfo)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundInfo)
}

func (rs *InfoResource) GetAllInfoPages(w http.ResponseWriter, r *http.Request) {
	foundInfos, err := rs.Infos.GetAll()
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundInfos)
}
