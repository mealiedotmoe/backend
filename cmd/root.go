package cmd

import (
	"fmt"
	homedir "github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"io/ioutil"
	"os"
)

var cfgFile string

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "backend",
	Short: "Backend API for mealie.moe",
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the RootCmd.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	RootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config.yaml)")
	RootCmd.PersistentFlags().Bool("skip-tls-verify", false, "Foolishly accept TLS certificates signed by unknown certificate authorities")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	RootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// Search config in home directory with name ".config.yaml"
		viper.SetConfigType("yaml")
		viper.SetConfigName("config")
		viper.AddConfigPath("/etc/mealiebackend/") // path to look for the config file in
		viper.AddConfigPath(".")                   // path to look for the config file in
		viper.AddConfigPath(home)
	}

	version, err := ioutil.ReadFile(".version")
	if err != nil {
		panic(err)
	}
	viper.Set("version", version)

	// Viper Defaults
	// App Defaults
	viper.SetDefault("port", "localhost:8810")
	viper.SetDefault("log_level", "debug")
	viper.SetDefault("db_debug", false)
	viper.SetDefault("admin_always", false)
	viper.SetDefault("dev", false)
	viper.SetDefault("database_url", "postgresql://mealie:password@localhost:5432/mealiedb?sslmode=disable")

	// Discord Defaults
	viper.SetDefault("discord_callback_url", "http://localhost:8810/api/v2/auth/callback")
	viper.SetDefault("discord_join_url", "https://discord.gg/anime")
	viper.SetDefault("discord_id", "148606162810568704")

	viper.SetEnvPrefix("mealie")
	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	} else {
		fmt.Printf(`Config file not found because "%s"`, err)
		fmt.Println("")
	}
}
