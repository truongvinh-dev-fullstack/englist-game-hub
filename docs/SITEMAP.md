# Sitemap & Navigation

```text
/                       Dashboard
/games                  Game library
/games/[slug]           Game overview/settings
/games/[slug]/play      Play session
/games/[slug]/result    Result (requires valid session reference)
/topics                 Topic listing
/topics/[slug]          Topic detail
/review                 Review queue
/progress               Learning progress
/profile                Profile/settings
/login                  Authentication
/admin                  Admin dashboard
/admin/topics           Topics CRUD
/admin/vocabulary       Vocabulary CRUD
/admin/questions        Question CRUD
/admin/scenarios        Roleplay scenario CRUD
/admin/import           CSV import
```

Desktop: header + sidebar optional; mobile: bottom navigation Home, Games, Topics, Progress, Account. Play mode hides global navigation, has accessible exit confirmation. Guest protected pages prompt sign-in without blocking play. Never put sensitive state in URL query strings.
