package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	// Import migrations package to register them
	_ "github.com/wylu1037/pulse/migrations"
)

//go:embed all:pb_public
var publicFS embed.FS

func main() {
	app := pocketbase.New()

	// register the migrate command
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangGo,
		Automigrate:  true,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		subFS, err := fs.Sub(publicFS, "pb_public")
		if err != nil {
			return err
		}

		se.Router.GET("/{path...}", apis.Static(subFS, false))
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
