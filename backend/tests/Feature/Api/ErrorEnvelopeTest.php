<?php

// Every API error must use the {"error":{code,message,status}} envelope
// documented in openapi.yaml's Error schema. This covers the "unknown route"
// case explicitly called out by the finding, in addition to the
// validation/throttle envelope tests colocated with their own endpoints.
//
// Note: a companion "a non-api route falls back to Laravel's default 404" case
// was deliberately dropped — it failed even on an unmodified bootstrap/app.php
// (verified by temporarily reverting that file and re-running), so it is a
// pre-existing quirk of unmatched *web* routes in this test environment,
// unrelated to and out of scope for this API-envelope fix.

test('an unknown api route returns the standard error envelope instead of the default 404 shape', function () {
    $response = $this->getJson('/api/v1/does-not-exist');

    $response->assertStatus(404)
        ->assertJsonPath('error.code', 'NOT_FOUND')
        ->assertJsonPath('error.status', 404)
        ->assertJsonStructure(['error' => ['code', 'message', 'status']]);
});
