package rest

import (
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/mealiedotmoe/backend/internal/faq"
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
		panic(err)
	}
	render.Respond(w, r, foundFaq)
}

type FaqRequest struct {
	Title   string `json:"faqTitle"`
	Content string `json:"faqContent"`
}

func (rs *FaqResource) CreateFaq(w http.ResponseWriter, r *http.Request) {
	faqRequest := &FaqRequest{}
	err := json.NewDecoder(r.Body).Decode(faqRequest)
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
	newFaq := &faq.Faq{
		Title:     faqRequest.Title,
		Author:    authorId,
		LastEdit:  authorId,
		Content:   faqRequest.Content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = rs.Faqs.Create(newFaq)
	if err != nil {
		panic(err)
	}
	render.Respond(w, r, newFaq)
}

func (rs *FaqResource) UpdateFaq(w http.ResponseWriter, r *http.Request) {
	faqId, err := strconv.Atoi(chi.URLParam(r, "faqId"))
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	foundFaq, err := rs.Faqs.Get(faqId)
	if err != nil {
		panic(err)
	}

	faqRequest := &FaqRequest{}
	err = json.NewDecoder(r.Body).Decode(faqRequest)
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

	foundFaq.Content = faqRequest.Content
	foundFaq.Title = faqRequest.Title
	foundFaq.LastEdit = authorId
	foundFaq.UpdatedAt = time.Now()
	err = rs.Faqs.Update(foundFaq)
	if err != nil {
		panic(err)
	}
	render.Respond(w, r, foundFaq)
}

func (rs *FaqResource) GetAllFaqs(w http.ResponseWriter, r *http.Request) {
	foundFaqs, err := rs.Faqs.GetAll()
	if err != nil {
		panic(err)
	}
	render.Respond(w, r, foundFaqs)
}
