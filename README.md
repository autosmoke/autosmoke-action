# AutoSmoke GitHub Action

Run AI-powered smoke tests on your web applications directly from GitHub Actions. AutoSmoke uses AI to intelligently navigate your application and verify critical user flows.

## Usage

```yaml
- name: Run Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `task-id` | The AutoSmoke task ID to run | Yes | - |
| `api-key` | Your AutoSmoke API key | Yes | - |
| `api-url` | AutoSmoke API base URL | No | `https://autosmoke.dev` |
| `wait-for-result` | Wait for test completion | No | `true` |
| `timeout` | Max wait time in seconds | No | `300` |
| `fail-on-test-failure` | Fail the action if test fails | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `run-id` | The ID of the triggered smoke test run |
| `status` | Final status: `queued`, `running`, `succeeded`, or `failed` |
| `run-url` | URL to view the full test results |

## Examples

### Run on Push to Main

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
          task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
          api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
```

### Run on Pull Requests

```yaml
name: PR Smoke Tests

on:
  pull_request:
    branches: [main]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run AutoSmoke Tests
        uses: autosmoke/autosmoke-action@v1
        with:
          task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
          api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
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
          task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
          api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
          timeout: '600'
```

### Fire and Forget (Don't Wait)

```yaml
- name: Trigger Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    wait-for-result: 'false'
```

### Non-Blocking (Continue on Failure)

```yaml
- name: Run Smoke Tests
  uses: autosmoke/autosmoke-action@v1
  with:
    task-id: ${{ vars.AUTOSMOKE_TASK_ID }}
    api-key: ${{ secrets.AUTOSMOKE_API_KEY }}
    fail-on-test-failure: 'false'
```

## Setup

1. **Create an AutoSmoke account** at [autosmoke.dev](https://autosmoke.dev)

2. **Create a smoke test task** in the AutoSmoke dashboard and copy the task ID

3. **Generate an API key** from your account settings

4. **Add secrets to your repository:**
   - Go to Settings > Secrets and variables > Actions
   - Add `AUTOSMOKE_API_KEY` as a secret
   - Add `AUTOSMOKE_TASK_ID` as a variable (or secret if you prefer)

5. **Add the workflow** to your repository in `.github/workflows/`

## Support

- [Documentation](https://autosmoke.dev/docs)
- [Report Issues](https://github.com/autosmoke/autosmoke-action/issues)
- [Contact Support](https://autosmoke.dev/contact)

## License

MIT
