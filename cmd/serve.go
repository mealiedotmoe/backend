package cmd

import (
	"context"
	"crypto/tls"
	"fmt"
	"github.com/mealiedotmoe/backend/database/migrate"
	"github.com/mealiedotmoe/backend/http/rest"
	"github.com/spf13/cobra"
	"log"
	"net/http"
	"os"
	"os/signal"
)

var runMigrations bool

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Serve the REST API",
	Run: func(cmd *cobra.Command, args []string) {

		if runMigrations {
			migrate.Migrate([]string{"up"})
		}

		// REST API
		server, err := rest.NewServer()
		if err != nil {
			log.Fatal(err)
		}
		go server.Start()

		quit := make(chan os.Signal)
		signal.Notify(quit, os.Interrupt)
		sig := <-quit

		log.Println("Shutting down REST server... Reason:", sig)
		if err := server.Server.Shutdown(context.Background()); err != nil {
			panic(err)
		}
		log.Println("Server gracefully stopped")

	},
}

func init() {
	RootCmd.AddCommand(serveCmd)

	tlsSkipVerify, err := RootCmd.Flags().GetBool("skip-tls-verify")
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: tlsSkipVerify}
	_, err = http.Get("https://golang.org/")
	if err != nil {
		fmt.Println(err)
	}

	serveCmd.Flags().BoolVar(&runMigrations, "migrate", false, "run migrations before startup")
}
