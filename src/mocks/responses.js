import { HttpResponse, delay } from "msw";

export async function mockDelay(ms = 250) {
  await delay(ms);
}

export function ok(data = null, message = "Success", meta = null, status = 200) {
  return HttpResponse.json(
    {
      success: true,
      message,
      data,
      meta,
    },
    { status }
  );
}

export function created(data = null, message = "Created successfully", meta = null) {
  return ok(data, message, meta, 201);
}

export function fail(
  message = "Something went wrong",
  code = "BAD_REQUEST",
  status = 400,
  details = {}
) {
  return HttpResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        details,
      },
      data: null,
      meta: null,
    },
    { status }
  );
}
