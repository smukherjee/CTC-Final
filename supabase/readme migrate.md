Great! Here’s a consolidated, minimal set of commands that works when you want to:

- connect your local Supabase project to a remote,  
- push schema from local to remote, **and**  
- push your local data to remote (via a clean `seed.sql`)  

Assuming you’re on macOS/Linux with `npm` and the Supabase CLI installed:

### 1. Link local to remote

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

- Replace `<YOUR_PROJECT_REF>` with the project ID from the Supabase dashboard URL (e.g., `dlwjwyfcyduowqvxcrrr`).[1][2]

### 2. Capture your local schema as a migration

If you created tables directly in local Studio instead of via migrations:

```bash
npx supabase db diff -f initial_schema
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql`. Check that it contains your tables before pushing.[3][4]

### 3. Push schema migrations to remote

```bash
npx supabase db push
```

- This applies all migrations in `supabase/migrations` to the linked remote DB.[5][1]

### 4. Create a clean seed file with local data (only `public` tables)

```bash
npx supabase db dump --local --data-only --schema public > supabase/seed.sql
```

- This dumps **only data** from your app tables in the `public` schema into `supabase/seed.sql`.[6][7]
- Open `supabase/seed.sql` and:
  - Remove any lines that mention `supabase_functions`, `auth`, `storage`, or `supabase_migrations`.  
  - Optionally keep `SETVAL` lines for `public` sequences (e.g., `clients_id_seq`, `cities_id_seq`) if you want IDs to continue from the same point.[8][9]

### 5. Push seed data to remote

```bash
npx supabase db push --include-seed
```

- The `--include-seed` flag runs `supabase/seed.sql` on the remote after applying migrations.[10][6]

### 6. (Optional) Verify sequence values on remote

If you want to ensure sequences on the remote are in sync with your 

```bash
npx supabase db run --db-url-postgres <REMOTE_DATABASE_URL> --file <(echo "SELECT pg_catalog.setval('public.cities_id_seq', 32, true); SELECT pg_catalog.setval('public.clients_id_seq', 8, true);")
```

This is just an example; you can inline any `setval` statements you kept in `seed.sql` if needed.[9][8]

***

### One‑line “working recipe” for you

From a fresh terminal in your project:

```bash
npx supabase login
npx supabase link --project-ref dlwjwyfcyduowqvxcrrr
npx supabase db diff -f initial_schema
npx supabase db push
npx supabase db dump --local --data-only --schema public > supabase/seed.sql
# Manually edit supabase/seed.sql to remove supabase_functions / auth / storage / etc. lines
npx supabase db push --include-seed
```

If you tell me whether you’re using `npx` or a globally installed `supabase` binary, I can rewrite this script without `npx` for you.

Sources
[1] supabase-cli — Commands, Examples & Usage Guide https://skywork.ai/clihub/keywords/supabase-cli.html
[2] Local Development & CLI | Supabase Docs https://supabase.com/docs/guides/local-development
[3] Supabase CLI - Provide option to restore a Postgres backup https://github.com/supabase/cli/issues/30
[4] Deploy database changes https://supabase.com/docs/guides/local-development/overview
[5] Database Migrations | Supabase Docs https://supabase.com/docs/guides/deployment/database-migrations
[6] Seeding your database | Supabase Docs https://supabase.com/docs/guides/local-development/seeding-your-database
[7] supabaseでローカル作業をリモートに反映するコマンドのメモ https://qiita.com/kurogoma939/items/b36409fb13804ebf27e2
[8] Postgres dump: pg_catalog.setval https://stackoverflow.com/questions/1060026/postgres-dump-pg-catalog-setval
[9] Documentation: 7.0: CREATE SEQUENCE - PostgreSQLwww.postgresql.org › docs › sql-createsequence https://www.postgresql.org/docs/7.0/sql-createsequence.htm
[10] Remote seeding with Supabase CLI #13832 https://github.com/orgs/supabase/discussions/13832
[11] CLI Reference | Supabase Docs https://supabase.com/docs/reference/cli/introduction
[12] How to push local development seed data to production https://github.com/orgs/supabase/discussions/26393
[13] How do I seed initial schema/data for self-hosted docker-compose ... https://github.com/orgs/supabase/discussions/12554
[14] Is Supabase the best experience for local/remote development or ... https://www.reddit.com/r/Supabase/comments/1ny80rn/is_supabase_the_best_experience_for_localremote/
[15] Updating the Supabase CLI https://supabase.com/docs/guides/local-development/cli/getting-started
[16] How does local development work? · supabase · Discussion #6366 https://github.com/orgs/supabase/discussions/6366
[17] Local Development and Database Branching // a more collaborative ... https://www.youtube.com/watch?v=N0Wb85m3YMI
