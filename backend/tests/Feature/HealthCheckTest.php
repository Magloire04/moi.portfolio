<?php

test('the health check route responds successfully', function () {
    $response = $this->get('/up');

    $response->assertStatus(200);
});
