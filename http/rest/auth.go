package rest

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/go-pg/pg/v10"
	"github.com/mealiedotmoe/backend/internal/user"
	"github.com/mealiedotmoe/backend/logging"
	"github.com/spf13/viper"
	"golang.org/x/oauth2"
	"net/http"
	"time"
)

// AuthResource implements user management handler.
type AuthResource struct {
	Users   user.UserStore
	Discord *oauth2.Config
}

// NewUserResource creates and returns a profile resource.
func NewAuthResource(store user.UserStore, discord *oauth2.Config) *AuthResource {
	return &AuthResource{
		Users:   store,
		Discord: discord,
	}
}

func (rs *AuthResource) Router() *chi.Mux {
	r := chi.NewRouter()
	r.Get("/login", rs.BeginAuth)
	r.Get("/callback", rs.AuthCallback)
	return r
}

func (rs *AuthResource) BeginAuth(w http.ResponseWriter, r *http.Request) {
	// Init values for redirect URL
	state, err := GenerateRandomString(32)
	if err != nil {
		render.Respond(w, r, "fuck")
	}
	// Build URL with above values and redirect
	redirectUrl := rs.Discord.AuthCodeURL(state, oauth2.AccessTypeOnline)
	http.Redirect(w, r, redirectUrl, http.StatusFound)
}

type discordUserResponse struct {
	Id            string `json:"id"`
	Username      string `json:"username"`
	Avatar        string `json:"avatar"`
	Discriminator string `json:"discriminator"`
	Email         string `json:"email"`
	Verified      bool   `json:"verified"`
	Locale        string `json:"locale"`
	MFAEnabled    bool   `json:"mfa_enabled"`
	PremiumType   int    `json:"premium_type"`
}

func (rs *AuthResource) AuthCallback(w http.ResponseWriter, r *http.Request) {
	log := logging.NewLogger()
	code, ok := r.URL.Query()["code"]
	if !ok {
		log.Debug("No code provided")
		return
	}
	token, err := rs.Discord.Exchange(r.Context(), code[0])
	if err != nil {
		log.Debug("Error exchanging code for token")
		panic(err)
	}
	response, err := rs.Discord.Client(r.Context(), token).Get("https://discordapp.com/api/users/@me")
	if err != nil {
		log.Debug("Error getting current User")
		panic(err)
	}
	if response.StatusCode != http.StatusOK {
		return
	}

	// TODO: look into non-defer closing https://www.joeshaw.org/dont-defer-close-on-writable-files/
	defer response.Body.Close()
	discordUser := &discordUserResponse{}
	err = json.NewDecoder(response.Body).Decode(discordUser)
	if err != nil {
		log.Debug("Error decoding body")
		log.Debug(err)
		panic(err)
	}

	updatedUser, err := rs.updateOrCreatUser(discordUser, token)
	if err != nil {
		panic(err)
	}

	newJWT, err := createNewToken(updatedUser)
	if err != nil {
		log.Debugf("Error generating new token: %s", err)
		panic(err)
	}

	mealieCallback := viper.GetString("mealie_callback") + "?token=" + newJWT
	http.Redirect(w, r, mealieCallback, http.StatusFound)
	return
}

func (rs *AuthResource) updateOrCreatUser(discordUser *discordUserResponse, token *oauth2.Token) (*user.User, error) {
	log := logging.NewLogger()
	foundUser, err := rs.Users.Get(discordUser.Id)
	if err != nil {
		if err.Error() == pg.ErrNoRows.Error() {
			newUser := &user.User{
				Username:     discordUser.Username,
				DiscordId:    discordUser.Id,
				Admin:        false,
			}
			err := rs.Users.Create(*newUser)
			if err != nil {
				log.Errorf("Error creating new user %s - %s", discordUser.Id, err)
				return nil, err
			}
			return newUser, nil
		} else {
			log.Debugf("Error searching for user %s - %s", discordUser.Id, err)
			return nil, err
		}
	}
	foundUser.Username = discordUser.Username
	err = rs.Users.Update(*foundUser)
	if err != nil {
		log.Debugf("Error updating user %s - %s", foundUser.DiscordId, err)
		return nil, err
	}
	return foundUser, nil
}

func createNewToken(jwtUser *user.User) (string, error) {
	claims := jwt.MapClaims{}
	claims["sub"] = jwtUser.DiscordId
	claims["exp"] = time.Now().Add(time.Hour * 24 * 7).Unix()
	claims["username"] = jwtUser.Username
	claims["isAdmin"] = jwtUser.Admin
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := at.SignedString([]byte(viper.GetString("jwt_secret")))
	if err != nil {
		return "", err
	}
	return token, nil
}

// GenerateRandomBytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}

	return b, nil
}

// GenerateRandomString returns a URL-safe, base64 encoded
// securely generated random string.
func GenerateRandomString(s int) (string, error) {
	b, err := GenerateRandomBytes(s)
	return base64.URLEncoding.EncodeToString(b), err
}
