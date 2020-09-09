package rest

import (
	"github.com/mealiedotmoe/backend/database/sqlconn"
	"github.com/mealiedotmoe/backend/logging"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"github.com/spf13/viper"
	"github.com/unrolled/secure"
)

// Server provides an http.Server.
type Server struct {
	*http.Server
}

// New configures application resources and routes.
func New(enableCORS bool) (*chi.Mux, error) {
	logger := logging.NewLogger()

	// Initialize DB w/ default values
	db, err := sqlconn.DBConn()
	if err != nil {
		logger.WithField("module", "database").Error(err)
		return nil, err
	}

	appAPI, err := NewAPI(db)
	if err != nil {
		logger.WithField("module", "app").Error(err)
		return nil, err
	}

	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.Timeout(15 * time.Second))

	r.Use(logging.NewStructuredLogger(logger))

	// Various security headers
	r.Use(secureMiddleware.Handler)
	r.Use(render.SetContentType(render.ContentTypeJSON))

	// use CORS middleware if client is not served by this api, e.g. from other domain or CDN
	if enableCORS {
		r.Use(corsConfig().Handler)
	}

	r.Group(func(r chi.Router) {
		r.Mount("/api/v2", appAPI.Router())
	})

	r.Get("/status", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("ok"))
		if err != nil {
			logger.WithField("module", "router").Error(err)
		}
	})

	r.Get("/version", func(w http.ResponseWriter, r *http.Request) {
		_, err = w.Write([]byte(viper.GetString("version")))
		if err != nil {
			logger.WithField("module", "router").Error(err)
		}
	})

	return r, nil
}

// NewServer creates and configures an APIServer serving all application routes.
func NewServer() (*Server, error) {
	log := logging.NewLogger()
	log.Println("Configuring REST server...")
	api, err := New(viper.GetBool("enable_cors"))
	if err != nil {
		return nil, err
	}

	var addr string
	port := viper.GetString("port")

	// allow port to be set as localhost:3000 in env during development to avoid "accept incoming network connection" request on restarts
	if strings.Contains(port, ":") {
		addr = port
	} else {
		addr = ":" + port
	}

	srv := http.Server{
		Addr:    addr,
		Handler: api,
	}

	return &Server{&srv}, nil
}

// Start runs ListenAndServe on the http.Server with graceful shutdown.
func (srv *Server) Start() {
	log := logging.NewLogger()
	log.Println("starting server...")
	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			panic(err)
		}
	}()
	log.Printf("Listening on %s", srv.Addr)
}

func corsConfig() *cors.Cors {
	if viper.GetBool("dev") {
		// Basic CORS
		// for more ideas, see: https://developer.github.com/v3/#cross-origin-resource-sharing
		return cors.New(cors.Options{
			// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
			AllowedOrigins: []string{"http://localhost:8080"},
			// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
			ExposedHeaders:   []string{"Link"},
			AllowCredentials: true,
			MaxAge:           86400, // Maximum value not ignored by any of major browsers
		})
	}
	// Basic CORS
	// for more ideas, see: https://developer.github.com/v3/#cross-origin-resource-sharing
	return cors.New(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://mealie.moe"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           86400, // Maximum value not ignored by any of major browsers
	})
}

// secureOptions is the set of parameters we are using to initialize the unrolled/secure library
var secureOptions = secure.Options{
	IsDevelopment:        !viper.GetBool("dev"),
	BrowserXssFilter:     true,
	FrameDeny:            true,
	SSLRedirect:          true,
	STSIncludeSubdomains: false,
	STSSeconds:           3600,
	STSPreload:           true,
	HostsProxyHeaders:    []string{"X-Forwarded-Host"},
	SSLProxyHeaders:      map[string]string{"X-Forwarded-Proto": "https"},
}

// secureMiddleware is the configuration we are using for the unrolled/secure library
var secureMiddleware = secure.New(secureOptions)
