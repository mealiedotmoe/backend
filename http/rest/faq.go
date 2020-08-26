package rest

import (
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/internal/faq"
	"github.com/mealiedotmoe/backend/logging"
	"net/http"
	"strconv"
	"time"
)

// AuthResource implements faq management handler.
type FaqResource struct {
	Faqs faq.FaqStore
}

// NewFaqResource creates and returns a profile resource.
func NewFaqResource(store faq.FaqStore) *FaqResource {
	return &FaqResource{
		Faqs: store,
	}
}

func (rs *FaqResource) Router() *chi.Mux {
	r := chi.NewRouter()
	r.Get("/", rs.GetAllFaqs)
	r.With(VerifyAuthToken, CheckAdmin).Post("/", rs.CreateFaq)
	r.With(VerifyAuthToken, CheckAdmin).Put("/{faqId}", rs.UpdateFaq)
	r.Get("/{faqId}", rs.GetFaq)
	return r
}

func (rs *FaqResource) GetFaq(w http.ResponseWriter, r *http.Request) {
	faqId, err := strconv.Atoi(chi.URLParam(r, "faqId"))
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundFaq, err := rs.Faqs.Get(faqId)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundFaq)
}

type FaqRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	Tag     string `json:"tag"`
	Color   string `json:"color"`
}

func (rs *FaqResource) CreateFaq(w http.ResponseWriter, r *http.Request) {
	log := logging.NewLogger()
	faqRequest := &FaqRequest{}
	err := json.NewDecoder(r.Body).Decode(faqRequest)
	if err != nil {
		log.Errorf("error decoding json: %s", err)
		http.Error(w, http.StatusText(422), 422)
		return
	}
	token, err := extractToken(r.Context())
	if err != nil {
		log.Errorf("error extracting token: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	authorId, ok := token.Claims.(jwt.MapClaims)["sub"].(string)
	if !ok {
		log.Errorf("error extract authorId from token: %s", err)
		http.Error(w, http.StatusText(403), 403)
		return
	}
	newFaq := &faq.Faq{
		Title:     faqRequest.Title,
		Author:    authorId,
		LastEdit:  authorId,
		Content:   faqRequest.Content,
		Tag:       faqRequest.Tag,
		Color:     faqRequest.Color,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = rs.Faqs.Create(newFaq)
	if err != nil {
		log.Errorf("error creating faq: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, newFaq)
}

func (rs *FaqResource) UpdateFaq(w http.ResponseWriter, r *http.Request) {
	logger := logging.NewLogger()
	faqId, err := strconv.Atoi(chi.URLParam(r, "faqId"))
	if err != nil {
		logger.Errorf("Error getting faqId param: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundFaq, err := rs.Faqs.Get(faqId)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		logger.Errorf("Error finding faq: %v - %s", faqId, err)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	faqRequest := &FaqRequest{}
	err = json.NewDecoder(r.Body).Decode(faqRequest)
	if err != nil {
		logger.Errorf("Invalid body passed in: %s", err)
		http.Error(w, http.StatusText(422), 422)
		return
	}
	token, err := extractToken(r.Context())
	if err != nil {
		logger.Errorf("Error extracting token: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	authorId, ok := token.Claims.(jwt.MapClaims)["sub"].(string)
	if !ok {
		logger.Errorf("Error retrieving authorId: %s", err)
		http.Error(w, http.StatusText(403), 403)
		return
	}

	foundFaq.Title = faqRequest.Title
	foundFaq.Content = faqRequest.Content
	foundFaq.Tag = faqRequest.Tag
	foundFaq.Color = faqRequest.Color
	foundFaq.LastEdit = authorId
	foundFaq.UpdatedAt = time.Now()
	err = rs.Faqs.Update(foundFaq)
	if err != nil {
		logger.Errorf("Error saving faq: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundFaq)
}

func (rs *FaqResource) GetAllFaqs(w http.ResponseWriter, r *http.Request) {
	log := logging.NewLogger()
	foundFaqs, err := rs.Faqs.GetAll()
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		log.Errorf("error retrieving faqs: %s", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	render.Respond(w, r, foundFaqs)
}
