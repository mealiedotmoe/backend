package rest

import (
	"context"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/spf13/viper"
	"net/http"
	"strings"
)

func extractToken(ctx context.Context) *jwt.Token {
	return ctx.Value("jwt-token").(*jwt.Token)
}

func VerifyAuthToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bearer := r.Header.Get("Authorization")
		if bearer == "" {
			http.Error(w, http.StatusText(401), 401)
			return
		}
		tokenString := strings.Split(bearer, " ")
		token, err := jwt.Parse(tokenString[1], func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method %v", token.Header["alg"])
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
		token := extractToken(r.Context())
		isAdmin, ok := token.Claims.(jwt.MapClaims)["isAdmin"].(bool)
		if !ok || !isAdmin {
			http.Error(w, http.StatusText(403), 403)
			return
		}
		next.ServeHTTP(w, r)
	})
}