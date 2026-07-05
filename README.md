# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Docker

The image uses pinned Node.js `22.12.0` and installs npm dependencies from
`package-lock.json` with `npm ci`. During the image build, the SQLite database is
generated from `src/data/verse-translations/*.json`, so `data/*.sqlite` does not
need to be committed.

Build and run locally:

```bash
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

For production secrets, run Docker Compose through your secret manager CLI, for
example:

```bash
doppler run -- docker compose up -d --build
```

## Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).
