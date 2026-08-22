<?php

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        // Locally and in tests this app serves from its own document root, so
        // the default 'api' prefix is what makes /api/v1/... routes resolve.
        // In production this app is physically nested at moi.bytechnum.com/api/,
        // so Laravel's own base-path detection already strips /api before
        // routing — adding the framework's automatic prefix on top would
        // require /api/api/v1/... instead.
        // This can't be driven by an env var: this array is built while
        // bootstrap/app.php itself is being required, which happens before
        // $app->handleRequest() runs the bootstrapper that loads .env — so
        // env() here always sees an empty environment and silently falls
        // back to its default, no matter what .env says. $_SERVER is
        // populated by the SAPI before any of this file runs, so detecting
        // the nesting from the invoked script's own path is what actually
        // works.
        apiPrefix: str_starts_with($_SERVER['SCRIPT_NAME'] ?? '', '/api/') ? '' : 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Every API error must use the {"error":{code,message,status}} envelope
        // documented in openapi.yaml's Error schema. Without this, only
        // ProjectController::show()'s hand-written 404 honored that contract;
        // validation failures, throttling, unknown routes, and 500s all fell
        // through to Laravel's default (differently-shaped) JSON error body.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => response()->json([
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'message' => $e->getMessage(),
                        'status' => 422,
                    ],
                ], 422),
                $e instanceof ThrottleRequestsException => response()->json([
                    'error' => [
                        'code' => 'TOO_MANY_REQUESTS',
                        'message' => 'Trop de requêtes, réessayez plus tard.',
                        'status' => 429,
                    ],
                ], 429),
                $e instanceof NotFoundHttpException => response()->json([
                    'error' => [
                        'code' => 'NOT_FOUND',
                        'message' => 'Ressource introuvable.',
                        'status' => 404,
                    ],
                ], 404),
                // Anything else on an API route: in debug mode (local/testing),
                // defer to Laravel's default handling so the full exception
                // detail is still visible during development. Outside debug
                // mode (staging/production), still honor the universal envelope
                // rather than leaking Laravel's default 500 shape.
                default => config('app.debug') ? null : response()->json([
                    'error' => [
                        'code' => 'SERVER_ERROR',
                        'message' => 'Une erreur inattendue est survenue.',
                        'status' => 500,
                    ],
                ], 500),
            };
        });
    })->create();
