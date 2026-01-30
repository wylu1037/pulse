/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // 创建 tags 表
  const tagsCollection = new Collection({
    id: "tags_collection_id",
    name: "tags",
    type: "base",
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 50,
        },
      },
      {
        name: "slug",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 50,
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        },
      },
      {
        name: "color",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 7,
        },
      },
      {
        name: "icon",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 50,
        },
      },
      {
        name: "order",
        type: "number",
        required: false,
        options: {
          min: 0,
          noDecimal: true,
        },
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_tags_name ON tags (name)",
      "CREATE UNIQUE INDEX idx_tags_slug ON tags (slug)",
    ],
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  dao.saveCollection(tagsCollection);

  // 创建 changelogs 表
  const changelogsCollection = new Collection({
    id: "changelogs_collection_id",
    name: "changelogs",
    type: "base",
    schema: [
      {
        name: "title",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 200,
        },
      },
      {
        name: "description",
        type: "editor",
        required: true,
        options: {
          convertUrls: false,
        },
      },
      {
        name: "version",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 50,
        },
      },
      {
        name: "date",
        type: "date",
        required: true,
        options: {
          min: "",
          max: "",
        },
      },
      {
        name: "tags",
        type: "relation",
        required: false,
        options: {
          collectionId: "tags_collection_id",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: ["name"],
        },
      },
    ],
    indexes: [
      "CREATE INDEX idx_changelogs_date ON changelogs (date DESC)",
      "CREATE INDEX idx_changelogs_version ON changelogs (version)",
    ],
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  dao.saveCollection(changelogsCollection);

  // 创建 site_config 表
  const siteConfigCollection = new Collection({
    id: "site_config_collection_id",
    name: "site_config",
    type: "base",
    schema: [
      {
        name: "site_title",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 100,
        },
      },
      {
        name: "site_description",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 500,
        },
      },
      {
        name: "logo_url",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"],
          thumbs: ["100x100"],
        },
      },
      {
        name: "primary_color",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 7,
          pattern: "^#[0-9A-Fa-f]{6}$",
        },
      },
    ],
    indexes: [],
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  dao.saveCollection(siteConfigCollection);

  // 插入初始标签数据
  const initialTags = [
    {
      name: "New Feature",
      slug: "new-feature",
      color: "#3B82F6",
      icon: "Sparkles",
      order: 1,
    },
    {
      name: "Bug Fix",
      slug: "bug-fix",
      color: "#EF4444",
      icon: "Bug",
      order: 2,
    },
    {
      name: "Improvement",
      slug: "improvement",
      color: "#10B981",
      icon: "TrendingUp",
      order: 3,
    },
    {
      name: "Security Update",
      slug: "security",
      color: "#F59E0B",
      icon: "Shield",
      order: 4,
    },
  ];

  initialTags.forEach((tag) => {
    const record = new Record(tagsCollection);
    record.set("name", tag.name);
    record.set("slug", tag.slug);
    record.set("color", tag.color);
    record.set("icon", tag.icon);
    record.set("order", tag.order);
    dao.saveRecord(record);
  });

  // 插入初始网站配置
  const configRecord = new Record(siteConfigCollection);
  configRecord.set("site_title", "Pulse Changelog");
  configRecord.set("site_description", "Product update log, recording every step of progress");
  configRecord.set("primary_color", "#3B82F6");
  dao.saveRecord(configRecord);

}, (db) => {
  const dao = new Dao(db);
  // 回滚操作
  try {
    const changelogs = dao.findCollectionByNameOrId("changelogs");
    if (changelogs) dao.deleteCollection(changelogs);
  } catch(e) {}
  try {
    const tags = dao.findCollectionByNameOrId("tags");
    if (tags) dao.deleteCollection(tags);
  } catch(e) {}
  try {
    const siteConfig = dao.findCollectionByNameOrId("site_config");
    if (siteConfig) dao.deleteCollection(siteConfig);
  } catch(e) {}
});
