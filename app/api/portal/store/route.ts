import { NextResponse } from 'next/server';

// The legacy whole-document JSON store is intentionally retired. All portal data
// is served by the normalized snapshot and changed through scoped lifecycle APIs.
const retired = () => NextResponse.json(
  { error: 'Legacy collection store retired; use scoped portal APIs.', code: 'ENDPOINT_RETIRED' },
  { status: 410, headers: { 'Cache-Control': 'no-store' } },
);

export const GET = retired;
export const PUT = retired;
export const DELETE = retired;
