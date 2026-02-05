package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// Create tags collection
		tagsCollection := core.NewBaseCollection("tags")
		tagsCollection.Id = "tags_collection_id"

		tagsCollection.Fields.Add(&core.TextField{
			Name:     "name",
			Required: true,
			Min:      1,
			Max:      50,
		})
		tagsCollection.Fields.Add(&core.TextField{
			Name:     "slug",
			Required: true,
			Min:      1,
			Max:      50,
			Pattern:  "^[a-z0-9]+(?:-[a-z0-9]+)*$",
		})
		tagsCollection.Fields.Add(&core.TextField{
			Name:     "color",
			Required: false,
			Min:      0,
			Max:      7,
		})
		tagsCollection.Fields.Add(&core.TextField{
			Name:     "icon",
			Required: false,
			Min:      0,
			Max:      50,
		})
		tagsCollection.Fields.Add(&core.NumberField{
			Name:     "order",
			Required: false,
			Min:      floatPtr(0),
		})

		tagsCollection.AddIndex("idx_tags_name", true, "name", "")
		tagsCollection.AddIndex("idx_tags_slug", true, "slug", "")

		tagsCollection.ListRule = strPtr("")
		tagsCollection.ViewRule = strPtr("")

		if err := app.Save(tagsCollection); err != nil {
			return err
		}

		// Create changelogs collection
		changelogsCollection := core.NewBaseCollection("changelogs")
		changelogsCollection.Id = "changelogs_collection_id"

		changelogsCollection.Fields.Add(&core.TextField{
			Name:     "title",
			Required: true,
			Min:      1,
			Max:      200,
		})
		changelogsCollection.Fields.Add(&core.EditorField{
			Name:        "description",
			Required:    true,
			ConvertURLs: false,
		})
		changelogsCollection.Fields.Add(&core.TextField{
			Name:     "version",
			Required: true,
			Min:      1,
			Max:      50,
		})
		changelogsCollection.Fields.Add(&core.DateField{
			Name:     "date",
			Required: true,
		})
		changelogsCollection.Fields.Add(&core.RelationField{
			Name:          "tags",
			Required:      false,
			CollectionId:  "tags_collection_id",
			CascadeDelete: false,
		})

		changelogsCollection.AddIndex("idx_changelogs_date", false, "date DESC", "")
		changelogsCollection.AddIndex("idx_changelogs_version", false, "version", "")

		changelogsCollection.ListRule = strPtr("")
		changelogsCollection.ViewRule = strPtr("")

		if err := app.Save(changelogsCollection); err != nil {
			return err
		}

		// Create site_config collection
		siteConfigCollection := core.NewBaseCollection("site_config")
		siteConfigCollection.Id = "site_config_collection_id"

		siteConfigCollection.Fields.Add(&core.TextField{
			Name:     "site_title",
			Required: true,
			Min:      1,
			Max:      100,
		})
		siteConfigCollection.Fields.Add(&core.TextField{
			Name:     "site_description",
			Required: true,
			Min:      1,
			Max:      500,
		})
		siteConfigCollection.Fields.Add(&core.FileField{
			Name:      "logo_url",
			Required:  false,
			MaxSelect: 1,
			MaxSize:   5242880,
			MimeTypes: []string{"image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"},
			Thumbs:    []string{"100x100"},
		})
		siteConfigCollection.Fields.Add(&core.TextField{
			Name:     "primary_color",
			Required: false,
			Min:      0,
			Max:      7,
			Pattern:  "^#[0-9A-Fa-f]{6}$",
		})

		siteConfigCollection.ListRule = strPtr("")
		siteConfigCollection.ViewRule = strPtr("")

		if err := app.Save(siteConfigCollection); err != nil {
			return err
		}

		// Insert initial tags
		initialTags := []struct {
			Name  string
			Slug  string
			Color string
			Icon  string
			Order float64
		}{
			{"New Feature", "new-feature", "#3B82F6", "Sparkles", 1},
			{"Bug Fix", "bug-fix", "#EF4444", "Bug", 2},
			{"Improvement", "improvement", "#10B981", "TrendingUp", 3},
			{"Security Update", "security", "#F59E0B", "Shield", 4},
		}

		for _, tag := range initialTags {
			record := core.NewRecord(tagsCollection)
			record.Set("name", tag.Name)
			record.Set("slug", tag.Slug)
			record.Set("color", tag.Color)
			record.Set("icon", tag.Icon)
			record.Set("order", tag.Order)
			if err := app.Save(record); err != nil {
				return err
			}
		}

		// Insert initial site configuration
		configRecord := core.NewRecord(siteConfigCollection)
		configRecord.Set("site_title", "Changelog")
		configRecord.Set("site_description", "Product update log, recording every step of progress")
		configRecord.Set("primary_color", "#171717")
		if err := app.Save(configRecord); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		// Rollback: delete collections in reverse order
		collections := []string{"changelogs", "tags", "site_config"}
		for _, name := range collections {
			collection, err := app.FindCollectionByNameOrId(name)
			if err == nil && collection != nil {
				if err := app.Delete(collection); err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func strPtr(s string) *string {
	return &s
}

func floatPtr(f float64) *float64 {
	return &f
}
