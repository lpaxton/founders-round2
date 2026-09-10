# Hosting the Fidelity Learning MCP

This package runs a stateless HTTP MCP server. It includes the article catalog and card interface. It does not include household portfolios, user data, credentials, or local Codex configuration.

## Container hosting

Upload this directory to a server with Docker and Compose, then run:

```sh
docker compose up -d --build
curl http://127.0.0.1:8000/health
```

Compose binds port 8000 to the server's loopback interface. Put your HTTPS reverse proxy in front of it. For example, with Caddy installed on that same server:

```caddyfile
mcp.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

Replace the example hostname with your domain and point its DNS to your server. The proxy must support streaming responses and forward POST, GET, DELETE, and OPTIONS requests without response buffering. Do not cache `/mcp` responses. Allow the MCP Accept and protocol headers through.

The external connector URL is `https://YOUR-DOMAIN/mcp`. `/health` returns JSON; `/` is not a website. The cards render in an MCP Apps-compatible host after a tool call.

For a managed container platform, build the Dockerfile and expose its HTTP port through the platform's HTTPS ingress. Set `PORT` to the port required by that platform (default 8000). No persistent disk or session affinity is needed.

## Native Node hosting

Use Node.js 24:

```sh
npm ci
npm run build
npm prune --omit=dev
PORT=8000 npm start
```

Run it under your server's process supervisor. The compiled entry point is `server-dist/server.js`; runtime requires `node_modules`, `package.json`, `server-dist/`, and `dist/`. Development uses `npm run dev`. Local stdio clients can use `npm run start:stdio` after building.

## Access and operations

The endpoint is unauthenticated and read-only. It exposes only curated public article summaries and links. Anyone who can reach it can call it. For private access, configure host-compatible authentication at your gateway before exposing it; this package does not implement OAuth. Do not add private household data to this public catalog.

Use your ingress provider's request limits as needed. Health checks use `/health`; SIGTERM/SIGINT initiate shutdown. Each request gets an independent MCP server instance. Content updates require rebuilding and restarting the service.

## Verify a deployment

From an installed development copy, run:

```sh
node scripts/check-http.mjs https://YOUR-DOMAIN
```

The check validates health, MCP initialization, college-topic results, the two-card/four-link response, and the bundled card resource. It makes no changes.

## Verification status

The package's build, routing tests, and compiled HTTP runtime are tested locally. Docker was not available on the packaging computer, so the Docker image must be built and checked on the target host. This archive has not been deployed to a public server.
