import * as core from "@actions/core";
import * as github from "@actions/github";

interface TriggerResponse {
  run: {
    id: string;
    status: string;
    scenario_id: string;
    flow_name: string;
  };
  error?: string;
}

interface RunResponse {
  run: {
    id: string;
    status: string;
    scenario_id: string;
    flow_name: string;
    started_at: string | null;
    finished_at: string | null;
    error: string | null;
    failing_step: string | null;
    failing_step_index: number | null;
    video_url: string | null;
  };
  error?: string;
}

async function triggerScenario(
  apiUrl: string,
  scenarioId: string,
  apiKey: string
): Promise<TriggerResponse> {
  const url = `${apiUrl}/api/scenarios/${scenarioId}/run`;

  core.info(`Triggering smoke test for scenario ${scenarioId}...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = (await response.json()) as TriggerResponse;

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Failed to trigger scenario`);
  }

  return data;
}

async function getRunStatus(
  apiUrl: string,
  runId: string,
  apiKey: string
): Promise<RunResponse> {
  const url = `${apiUrl}/api/runs/${runId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const data = (await response.json()) as RunResponse;

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Failed to get run status`);
  }

  return data;
}

async function waitForCompletion(
  apiUrl: string,
  runId: string,
  apiKey: string,
  timeoutSeconds: number
): Promise<RunResponse> {
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  const pollIntervalMs = 5000; // Poll every 5 seconds

  while (Date.now() - startTime < timeoutMs) {
    const response = await getRunStatus(apiUrl, runId, apiKey);
    const status = response.run.status;

    core.info(`Run status: ${status}`);

    if (status === "succeeded" || status === "failed") {
      return response;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Timeout: Smoke test did not complete within ${timeoutSeconds} seconds`);
}

function formatDuration(startedAt: string, finishedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  const durationMs = end - start;
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

async function run(): Promise<void> {
  try {
    // Get inputs
    const scenarioId = core.getInput("scenario-id", { required: true });
    const apiKey = core.getInput("api-key", { required: true });
    const apiUrl = core.getInput("api-url") || "https://autosmoke.dev";
    const waitForResult = core.getInput("wait-for-result") !== "false";
    const timeout = parseInt(core.getInput("timeout") || "300", 10);
    const failOnTestFailure = core.getInput("fail-on-test-failure") !== "false";

    // Log context
    const context = github.context;
    core.info(`Repository: ${context.repo.owner}/${context.repo.repo}`);
    core.info(`Event: ${context.eventName}`);
    if (context.eventName === "pull_request") {
      core.info(`PR: #${context.payload.pull_request?.number}`);
    }
    core.info(`SHA: ${context.sha.substring(0, 7)}`);

    // Trigger the scenario
    const triggerResult = await triggerScenario(apiUrl, scenarioId, apiKey);
    const runId = triggerResult.run.id;

    core.info(`Smoke test triggered successfully!`);
    core.info(`Run ID: ${runId}`);

    // Set outputs
    core.setOutput("run-id", runId);
    core.setOutput("run-url", `${apiUrl}/runs/${runId}`);

    if (!waitForResult) {
      core.info("Not waiting for result (wait-for-result=false)");
      core.setOutput("status", "queued");
      return;
    }

    // Wait for completion
    core.info(`Waiting for smoke test to complete (timeout: ${timeout}s)...`);
    const finalResult = await waitForCompletion(apiUrl, runId, apiKey, timeout);
    const finalStatus = finalResult.run.status;

    core.setOutput("status", finalStatus);

    // Log results
    core.info("=".repeat(50));
    core.info(`Smoke Test Results`);
    core.info("=".repeat(50));
    core.info(`Flow: ${finalResult.run.flow_name}`);
    core.info(`Status: ${finalStatus.toUpperCase()}`);

    if (finalResult.run.started_at && finalResult.run.finished_at) {
      core.info(`Duration: ${formatDuration(finalResult.run.started_at, finalResult.run.finished_at)}`);
    }

    if (finalResult.run.video_url) {
      core.info(`Video: ${finalResult.run.video_url}`);
    }

    if (finalStatus === "failed") {
      core.info("");
      core.error(`Smoke test FAILED`);

      if (finalResult.run.failing_step !== null) {
        core.error(`Failed at step ${(finalResult.run.failing_step_index ?? 0) + 1}: ${finalResult.run.failing_step}`);
      }

      if (finalResult.run.error) {
        core.error(`Error: ${finalResult.run.error}`);
      }

      if (failOnTestFailure) {
        core.setFailed("Smoke test failed");
      }
    } else {
      core.info("");
      core.info(`Smoke test PASSED`);
    }

    // Create summary
    await core.summary
      .addHeading("AutoSmoke Results")
      .addTable([
        [
          { data: "Flow", header: true },
          { data: "Status", header: true },
          { data: "Duration", header: true },
        ],
        [
          finalResult.run.flow_name,
          finalStatus === "succeeded" ? "PASSED" : "FAILED",
          finalResult.run.started_at && finalResult.run.finished_at
            ? formatDuration(finalResult.run.started_at, finalResult.run.finished_at)
            : "-",
        ],
      ])
      .addLink("View Full Results", `${apiUrl}/runs/${runId}`)
      .write();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(message);
  }
}

run();
