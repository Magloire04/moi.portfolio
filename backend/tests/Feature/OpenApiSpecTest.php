<?php

use Symfony\Component\Yaml\Yaml;

test('openapi.yaml exists and documents every public endpoint', function () {
    $path = base_path('openapi.yaml');

    expect(file_exists($path))->toBeTrue();

    $spec = Yaml::parseFile($path);

    expect($spec['paths'])->toHaveKeys([
        '/v1/projects',
        '/v1/projects/{slug}',
        '/v1/settings',
        '/v1/contact-messages',
    ]);
});
