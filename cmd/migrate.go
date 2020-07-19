package cmd

import (
	"github.com/mealiedotmoe/backend/database/migrate"
	"github.com/spf13/cobra"
)

var reset bool

// migrateCmd represents the migrate command
var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "use go-pg migration tool",
	Long:  `migrate uses go-pg migration tool under the hood supporting the same commands and an additional reset command`,
	Run: func(cmd *cobra.Command, args []string) {
		migrate.Migrate(args)
	},
}

func init() {
	RootCmd.AddCommand(migrateCmd)
}
