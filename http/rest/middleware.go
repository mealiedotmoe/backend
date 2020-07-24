package rest

import (
	"context"
	"errors"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/spf13/viper"
	"net/http"
)

func extractToken(ctx context.Context) (*jwt.Token, error) {
	token, ok := ctx.Value("jwt-token").(*jwt.Token)
	if !ok {
		return nil, errors.New("invalid token provided")
	}
	return token, nil
}

func VerifyAuthToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString, err := r.Cookie("session-jwt")
		if err != nil {
			http.Error(w, http.StatusText(401), 401)
			return
		}
		if tokenString.Value == "" {
			http.Error(w, http.StatusText(401), 401)
			return
		}
		token, err := jwt.Parse(tokenString.Value, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method %v", token.Header["alg"])
			}
			return []byte(viper.GetString("jwt_secret")), nil
		})
		if err != nil {
			fmt.Println(err)
			http.Error(w, http.StatusText(403), 403)
			return
		}
		ctx := context.WithValue(r.Context(), "jwt-token", token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func CheckAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, err := extractToken(r.Context())
		if err != nil {
			fmt.Println(fmt.Errorf("error extracting token"))
			http.Error(w, http.StatusText(403), 403)
			return
		}
		isAdmin, ok := token.Claims.(jwt.MapClaims)["isAdmin"].(bool)
		if !ok || !isAdmin {
			fmt.Println(fmt.Errorf("user is not an admin"))
			http.Error(w, http.StatusText(403), 403)
			return
		}
		next.ServeHTTP(w, r)
	})
}
