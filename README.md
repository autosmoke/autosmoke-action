# AutoSmoke GitHub Action

Run AI-powered smoke tests on your web applications directly from GitHub Actions. AutoSmoke uses AI to intelligently navigate your application and verify critical user flows.

## Usage

You can either reference a pre-configured scenario by ID, or define test steps directly in your workflow YAML.

**Using a scenario ID:**

```yaml
- name: Run Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    scenario-id: ${{ vars.AUTOSMOKE_SCENARIO_ID }}
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
```

**Using inline steps:**

```yaml
- name: Run Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    name: Login Flow
    steps: |
      Navigate to https://myapp.com
      Click the "Sign In" button
      Enter "user@example.com" in the email field
      Enter "password123" in the password field
      Click the "Log In" button
      Verify the page contains "Welcome"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `scenario-id` | The AutoSmoke test scenario ID to run (mutually exclusive with `steps`) | No* | - |
| `steps` | Inline test steps, one per line (mutually exclusive with `scenario-id`) | No* | - |
| `name` | Test name (used with inline steps, defaults to workflow name) | No | - |
| `vars` | Variables for inline steps as `KEY=VALUE` per line or a JSON object | No | - |
| `api-key` | Your AutoSmoke API key | Yes | - |
| `api-url` | AutoSmoke API base URL | No | `https://autosmoke.dev` |
| `wait-for-result` | Wait for test completion | No | `true` |
| `timeout` | Max wait time in seconds | No | `300` |
| `fail-on-test-failure` | Fail the action if test fails | No | `true` |

> *Exactly one of `scenario-id` or `steps` must be provided.

## Outputs

| Output | Description |
|--------|-------------|
| `run-id` | The ID of the triggered smoke test run |
| `status` | Final status: `queued`, `running`, `succeeded`, or `failed` |
| `run-url` | URL to view the full test results |

## Examples

### Run a Scenario on Push

```yaml
name: Smoke Tests

on:
  push:
    branches: [main]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run AutoSmoke Tests
        uses: autosmoke/autosmoke-action@v1
        with:
          scenario-id: ${{ vars.AUTOSMOKE_SCENARIO_ID }}
          api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
```

### Inline Steps

Define test steps directly in your workflow without creating a scenario in the dashboard first.

```yaml
name: Smoke Tests

on:
  push:
    branches: [main]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Login Flow Test
        uses: autosmoke/autosmoke-action@v1
        with:
          api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
          name: Login Flow
          steps: |
            Navigate to https://myapp.com
            Click the "Sign In" button
            Enter "user@example.com" in the email field
            Enter "password123" in the password field
            Click the "Log In" button
            Verify the page contains "Welcome"
```

### Inline Steps with Variables

Pass variables to your inline steps using `KEY=VALUE` lines or a JSON object.

```yaml
- name: Run Checkout Test
  uses: autosmoke/autosmoke-action@v1
  with:
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    name: Checkout Flow
    steps: |
      Navigate to https://myapp.com/products
      Click the first product card
      Click the "Add to Cart" button
      Navigate to https://myapp.com/cart
      Verify the cart contains 1 item
    vars: |
      PROMO_CODE=SAVE10

# Or with JSON
- name: Run Search Test
  uses: autosmoke/autosmoke-action@v1
  with:
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    name: Search
    steps: |
      Navigate to https://myapp.com
      Type "running shoes" in the search field
      Press Enter
      Verify the page contains "results"
    vars: '{"LOCALE": "en-US"}'
```

### Scheduled Tests

```yaml
name: Scheduled Smoke Tests

on:
  schedule:
    - cron: '0 * * * *'  # Every hour

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run AutoSmoke Tests
        uses: autosmoke/autosmoke-action@v1
        with:
          scenario-id: ${{ vars.AUTOSMOKE_SCENARIO_ID }}
          api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
          timeout: '600'
```

### Fire and Forget (Don't Wait)

```yaml
- name: Trigger Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    scenario-id: ${{ vars.AUTOSMOKE_SCENARIO_ID }}
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    wait-for-result: 'false'
```

### Non-Blocking (Continue on Failure)

```yaml
- name: Run Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    scenario-id: ${{ vars.AUTOSMOKE_SCENARIO_ID }}
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    fail-on-test-failure: 'false'
```

## Setup

1. **Create an AutoSmoke account** at [autosmoke.dev](https://autosmoke.dev)

2. **Generate an API key** from your account settings

3. **Add secrets to your repository:**
   - Go to Settings > Secrets and variables > Actions
   - Add `AUTOSMOKE_API_KEY` as a secret
   - If using scenario IDs: add `AUTOSMOKE_SCENARIO_ID` as a variable

4. **Add the workflow** to your repository in `.github/workflows/`
   - Use `scenario-id` to run a pre-configured scenario from the dashboard, or
   - Use `steps` to define test steps directly in the workflow YAML

## Support

- [Documentation](https://autosmoke.dev/docs)
- [Report Issues](https://github.com/autosmoke/autosmoke-action/issues)
- [Contact Support](https://autosmoke.dev/contact)

## License

MIT
