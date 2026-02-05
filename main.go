package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

//go:embed all:pb_public
var publicFS embed.FS

func main() {
	app := pocketbase.New()

	// register the jsvm plugin
	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: "", // uses the default "pb_migrations"
	})

	// register the migrate command
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
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
