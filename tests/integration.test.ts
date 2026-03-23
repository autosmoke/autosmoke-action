/**
 * Integration test for GitHub Action Bearer token authentication.
 *
 * Required env vars:
 *   API_URL  - e.g. https://autosmoke.dev or http://localhost:3000
 *   API_KEY  - a valid ask_* API key
 *   TASK_ID  - a task ID accessible by the key's project
 *
 * Run:  bun test
 */

import { describe, test, expect, beforeAll } from "bun:test";

let API_URL: string;
let API_KEY: string;
let TASK_ID: string;

beforeAll(() => {
  API_URL = process.env.API_URL!;
  API_KEY = process.env.API_KEY!;
  TASK_ID = process.env.TASK_ID!;

  if (!API_URL || !API_KEY || !TASK_ID) {
    throw new Error("Missing required env vars: API_URL, API_KEY, TASK_ID");
  }
});

let runId: string | undefined;

describe("API authentication", () => {
  test("POST /api/tasks/{id}/run with valid key returns 201 and run id", async () => {
    const res = await fetch(`${API_URL}/api/tasks/${TASK_ID}/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.run?.id).toBeTruthy();
    runId = body.run?.id as string;
  });

  test("GET /api/runs/{id} with valid key returns 200 and matching run", async () => {
    if (!runId) throw new Error("No runId from previous test");
    const res = await fetch(`${API_URL}/api/runs/${runId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.run?.id).toBe(runId);
  });

  test("POST /api/tasks/{id}/run with invalid key returns 401", async () => {
    const res = await fetch(`${API_URL}/api/tasks/${TASK_ID}/run`, {
      method: "POST",
      headers: { Authorization: "Bearer ask_invalid0000000000000000000000" },
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/tasks/{id}/run with no auth returns 401", async () => {
    const res = await fetch(`${API_URL}/api/tasks/${TASK_ID}/run`, {
      method: "POST",
    });
    expect(res.status).toBe(401);
  });
});
