# Storyblok content model

This folder owns the Storyblok schema for the Emporva web app. The schema is the source of truth for content types — when it changes here, push it to Storyblok; when it changes in the Storyblok UI, pull it back here and commit.

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `service` | Content type (root) | Individual service detail page (`/services/:slug`). |
| `services_index` | Content type (root) | Landing page for `/services`. |
| `bullet` | Nested blok | Single bullet used inside `service.common_issues` and `service.process_steps`. |

The TypeScript interfaces in `src/services/storyblokService.ts` (`ServiceStoryContent`, `ServicesIndexContent`, `BulletBlok`) mirror these schemas. Keep them in sync.

**Space ID:** `290960764133094` · **Region:** `eu`

## Push the schema to Storyblok

`npm run storyblok:push` runs a small Node script (`push-components.mjs`) that uses the Storyblok Management API directly. The official CLI was unreliable for this space (region detection issues + crashes on empty spaces), so we bypass it for pushes.

You need a **Personal Access Token** (Storyblok → click your avatar → **Account Settings** → **Personal Access Tokens** → **Generate new token**). Add it to `.env`:

```
STORYBLOK_OAUTH_TOKEN=your-personal-access-token
```

Then:

```bash
# loads .env via dotenv-cli, or just export the var inline:
STORYBLOK_OAUTH_TOKEN=xxx npm run storyblok:push
```

The script upserts each component in `components.json`: existing components (matched by name) are updated, missing ones are created. Existing content/stories are not touched.

## Pull the schema from Storyblok

After editing components in the Storyblok UI:

```bash
npm run storyblok:pull
```

By default this writes a `components.<space>.json` file in the working directory — rename it to `storyblok/components.json` (overwriting the existing file) and commit the diff.

## Creating content (one-time, manual)

The CLI only handles schema. Content entries are created in the Storyblok UI:

1. Create a folder named `services` at the root.
2. Inside it, create one story per service: `plumbing`, `electrical`, `roofing`, `hvac`, `remodel`, `drainage`. Pick the **Service** content type for each. Slug = the URL segment.
3. Create one root-level story with slug `services` of type **Services Index**.
4. Publish each story.

## Environment variables

Add to `.env` (local dev) and Vercel project settings (deployed):

```
VITE_STORYBLOK_TOKEN=your-preview-access-token
```

The preview access token is created in Storyblok → Settings → Access Tokens. Use a **preview** token (not public) so draft content shows in dev. The app reads draft in `import.meta.env.DEV` and published in production.
