package rest

import (
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/internal/palette"
	"net/http"
	"strconv"
	"time"
)

// AuthResource implements palette management handler.
type PaletteResource struct {
	Palettes palette.PaletteStore
}

// NewPaletteResource creates and returns a profile resource.
func NewPaletteResource(store palette.PaletteStore) *PaletteResource {
	return &PaletteResource{
		Palettes: store,
	}
}

func (rs *PaletteResource) Router() *chi.Mux {
	r := chi.NewRouter()
	r.Get("/", rs.GetAllUserPalettes)
	r.Post("/", rs.CreatePalette)
	r.Put("/{paletteId}", rs.UpdatePalette)
	r.Get("/{paletteId}", rs.GetPalette)
	r.Delete("/{paletteId}", rs.DeletePalette)
	return r
}

func (rs *PaletteResource) GetPalette(w http.ResponseWriter, r *http.Request) {
	paletteId, err := strconv.Atoi(chi.URLParam(r, "paletteId"))
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundPalette, err := rs.Palettes.Get(paletteId)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundPalette)
}

type PaletteRequest struct {
	Name        string `json:"name"`
	Clover      string `json:"clover"`
	Member      string `json:"member"`
	Active      string `json:"active"`
	Regular     string `json:"regular"`
	Contributor string `json:"contributor"`
	Addicted    string `json:"addicted"`
	Insomniac   string `json:"insomniac"`
	Nolifer     string `json:"nolifer"`
	Birthday    string `json:"birthday"`
}

func (rs *PaletteResource) CreatePalette(w http.ResponseWriter, r *http.Request) {
	paletteRequest := &PaletteRequest{}
	err := json.NewDecoder(r.Body).Decode(paletteRequest)
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
	newPalette := &palette.Palette{
		UserId:      authorId,
		Name:        paletteRequest.Name,
		Clover:      paletteRequest.Clover,
		Member:      paletteRequest.Member,
		Active:      paletteRequest.Active,
		Regular:     paletteRequest.Regular,
		Contributor: paletteRequest.Contributor,
		Addicted:    paletteRequest.Addicted,
		Insomniac:   paletteRequest.Insomniac,
		Nolifer:     paletteRequest.Nolifer,
		Birthday:    paletteRequest.Birthday,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	err = rs.Palettes.Create(newPalette)
	if err != nil {
		pgErr, ok := err.(pg.Error)
		if ok && pgErr.IntegrityViolation() {
			http.Error(w, http.StatusText(409), 409)
			return
		} else {
			panic(err)
		}
	}
	render.Respond(w, r, newPalette)
}

func (rs *PaletteResource) UpdatePalette(w http.ResponseWriter, r *http.Request) {
	paletteId, err := strconv.Atoi(chi.URLParam(r, "paletteId"))
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundPalette, err := rs.Palettes.Get(paletteId)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
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

	if authorId != foundPalette.UserId {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	paletteRequest := &PaletteRequest{}
	err = json.NewDecoder(r.Body).Decode(paletteRequest)
	if err != nil {
		http.Error(w, http.StatusText(422), 422)
		return
	}

	foundPalette.Name = paletteRequest.Name
	foundPalette.Clover = paletteRequest.Clover
	foundPalette.Member = paletteRequest.Member
	foundPalette.Active = paletteRequest.Active
	foundPalette.Regular = paletteRequest.Regular
	foundPalette.Contributor = paletteRequest.Contributor
	foundPalette.Addicted = paletteRequest.Addicted
	foundPalette.Insomniac = paletteRequest.Insomniac
	foundPalette.Nolifer = paletteRequest.Nolifer
	foundPalette.Birthday = paletteRequest.Birthday
	foundPalette.UpdatedAt = time.Now()
	err = rs.Palettes.Update(foundPalette)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundPalette)
}

func (rs *PaletteResource) DeletePalette(w http.ResponseWriter, r *http.Request) {
	paletteId, err := strconv.Atoi(chi.URLParam(r, "paletteId"))
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundPalette, err := rs.Palettes.Get(paletteId)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
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

	if authorId != foundPalette.UserId {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	err = rs.Palettes.Delete(foundPalette.ID)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundPalette)
}

func (rs *PaletteResource) GetAllUserPalettes(w http.ResponseWriter, r *http.Request) {
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
	foundPalettes, err := rs.Palettes.GetByUser(authorId)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundPalettes)
}
