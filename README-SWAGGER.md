# DoctorHub Swagger/OpenAPI setup

This bundle contains a drop-in OpenAPI 3.0.3 document for the current DoctorHub API.

## 1. Install Swagger UI

```bash
npm install swagger-ui-express
npm install -D @types/swagger-ui-express
```

## 2. Copy the file

Copy `swagger.ts` into:

```text
src/app/docs/swagger.ts
```

## 3. Register Swagger in `src/app.ts`

Add:

```ts
import { setupSwagger } from "./app/docs/swagger";
```

After your Express middleware (`express.json`, `cookieParser`, etc.) and before or after the API route mounts, call:

```ts
setupSwagger(app);
```

For example:

```ts
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use("/api/v1/auth", AuthRoutes);
```

## 4. Test locally

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5000/api-docs
```

Raw OpenAPI JSON:

```text
http://localhost:5000/api-docs.json
```

## 5. Production

After deploying the updated project to Render:

```text
https://doctorhub.onrender.com/api-docs
```

Raw OpenAPI JSON:

```text
https://doctorhub.onrender.com/api-docs.json
```

## Authorization in Swagger UI

1. Log in using `/api/v1/auth/login`.
2. Copy the returned access token.
3. Click **Authorize** in Swagger UI.
4. Paste the token in the Bearer field.
5. Call protected endpoints.

The document also records cookie-based authentication, but Bearer authentication is the easiest way to test protected APIs interactively in Swagger UI.
