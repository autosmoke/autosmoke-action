# Publishing AutoSmoke GitHub Action to Marketplace

## Prerequisites

- GitHub account with permissions to create repositories
- The `github-action/` directory contents from this project

## Step 1: Create a New Repository

1. Go to [github.com/new](https://github.com/new)
2. Name the repository `autosmoke-action`
3. Set visibility to **Public** (required for Marketplace)
4. Do not initialize with README (we have our own)
5. Click **Create repository**

## Step 2: Push the Action Code

```bash
# From the github-action directory
cd github-action

# Initialize git and push
git init
git add .
git commit -m "Initial commit: AutoSmoke GitHub Action"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/autosmoke-action.git
git push -u origin main
```

## Step 3: Create a Release

1. Go to your repository on GitHub
2. Click **Releases** in the right sidebar
3. Click **Create a new release**
4. Click **Choose a tag** and type `v1`
5. Click **Create new tag: v1 on publish**
6. Set release title to `v1.0.0`
7. Add release notes:
   ```
   ## AutoSmoke GitHub Action v1.0.0

   Initial release of the AutoSmoke GitHub Action.

   ### Features
   - Trigger smoke tests on push, PR, or schedule
   - Wait for test completion with configurable timeout
   - Report results in GitHub Actions summary
   - Fail workflow on test failure (configurable)

   ### Usage
   ```yaml
   - uses: autosmoke/autosmoke-action@v1
     with:
       task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
       api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
   ```
   ```
8. Click **Publish release**

## Step 4: Publish to Marketplace

1. After creating the release, go to the repository main page
2. You should see a banner: **"Publish this Action to the GitHub Marketplace"**
3. Click **Draft a release** or edit your existing release
4. Check **Publish this Action to the GitHub Marketplace**
5. Select the primary category: **Testing**
6. Select secondary category: **Continuous integration**
7. Review the listing information (pulled from `action.yml`)
8. Click **Publish release**

## Step 5: Verify Marketplace Listing

1. Go to [github.com/marketplace](https://github.com/marketplace)
2. Search for "AutoSmoke"
3. Verify your action appears with correct branding and description

## Directory Structure

```
github-action/
├── action.yml          # Action metadata (name, inputs, outputs, branding)
├── src/index.ts        # TypeScript source code
├── dist/index.js       # Compiled JavaScript (must be committed)
├── package.json        # Dependencies and build script
├── tsconfig.json       # TypeScript configuration
├── README.md           # Documentation shown on Marketplace
├── .gitignore
└── examples/           # Example workflow files
    ├── on-push.yml
    ├── on-pull-request.yml
    ├── scheduled.yml
    └── complete.yml
```

## Important Notes

### The `dist/` folder must be committed

GitHub Actions run the compiled JavaScript from `dist/index.js`. This file **must be committed** to the repository. When making changes:

```bash
npm run build
git add dist/
git commit -m "Rebuild dist"
```

### Versioning

- Use semantic versioning: `v1.0.0`, `v1.1.0`, `v2.0.0`
- Maintain a `v1` tag that points to the latest `v1.x.x` release
- Users reference `@v1` to get automatic minor/patch updates

To update the `v1` tag after a new release:

```bash
git tag -f v1
git push origin v1 --force
```

### API Authentication Required

The current API endpoint (`/api/tasks/[id]/run`) does not validate the `Authorization` header. Before production use, add API key authentication:

```typescript
// In frontend/app/api/tasks/[id]/run/route.ts
const authHeader = request.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const apiKey = authHeader.slice(7);
// Validate apiKey against your database
```

## Updating the Action

1. Make changes to `src/index.ts`
2. Run `npm run build` to recompile
3. Commit both source and dist changes
4. Create a new release (e.g., `v1.1.0`)
5. Update the `v1` tag to point to the new release

## Support

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Publishing Actions to Marketplace](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace)
