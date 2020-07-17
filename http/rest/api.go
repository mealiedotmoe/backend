package rest

import (
	"github.com/go-chi/chi"
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/internal/faq"
	"github.com/mealiedotmoe/backend/internal/info"
	"github.com/mealiedotmoe/backend/internal/palette"
	"github.com/mealiedotmoe/backend/internal/user"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"golang.org/x/oauth2"
	"net/http"
)

// API provides application resources and handlers.
type API struct {
	Auth    *AuthResource
	User    *UserResource
	Faq     *FaqResource
	Info    *InfoResource
	Palette *PaletteResource
}

// NewAPI configures and returns application API.
func NewAPI(db *pg.DB) (*API, error) {
	// Create the discord oauth config store
	config := &oauth2.Config{
		ClientID:     viper.GetString("discord_client_id"),
		ClientSecret: viper.GetString("discord_client_secret"),
		Endpoint: oauth2.Endpoint{
			AuthURL:   "https://discord.com/api/oauth2/authorize",
			TokenURL:  "https://discord.com/api/v6/oauth2/token",
			AuthStyle: 2,
		},
		RedirectURL: viper.GetString("discord_callback_url"),
		Scopes:      []string{"identify", "guilds"},
	}

	// Auth/User routes
	userStore := user.NewUserStore(db)
	authApi := NewAuthResource(userStore, config)
	userApi := NewUserResource(userStore)

	faqStore := faq.NewFaqStore(db)
	faqApi := NewFaqResource(faqStore)

	infoStore := info.NewInfoStore(db)
	infoApi := NewInfoResource(infoStore)

	paletteStore := palette.NewPaletteStore(db)
	paletteApi := NewPaletteResource(paletteStore)

	api := &API{
		Auth:    authApi,
		User:    userApi,
		Faq:     faqApi,
		Info:    infoApi,
		Palette: paletteApi,
	}
	return api, nil
}

// Router provides application routes.
func (a *API) Router() *chi.Mux {
	r := chi.NewRouter()
	r.Mount("/auth", a.Auth.Router())
	r.With(VerifyAuthToken).Mount("/user", a.User.Router())
	r.Mount("/faq", a.Faq.Router())
	r.Mount("/info", a.Info.Router())
	r.With(VerifyAuthToken).Mount("/palette/me", a.Palette.Router())
	return r
}

func log(r *http.Request) logrus.FieldLogger {
	return logging.GetLogEntry(r)
}
