# Backend API (Laravel + Filament) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Laravel API + Filament admin that powers the ByTechnum portfolio — content management for projects/testimonials/settings, a public read API the Next.js frontend will consume at build time, and a contact form endpoint.

**Architecture:** Laravel 12 app in `backend/`, MySQL in production / SQLite for dev+tests. Public JSON API under `/api/v1/*` (read-only, unauthenticated) feeds Next.js static generation. Filament v3 admin panel at `/admin` is the only way to write content — no public write endpoints except the contact form.

**Tech Stack:** PHP 8.2+, Laravel 12, Filament 3, Pest, SQLite (dev/test), MySQL (prod).

**Spec:** `docs/superpowers/specs/2026-08-20-portfolio-bytechnum-design.md`

## Global Constraints

- PHP 8.2+, Laravel 12. SQLite for local dev and tests (`database/database.sqlite` for dev, in-memory for tests); MySQL is prod-only and out of scope for this plan (config only, no live migration against Spaceship in these tasks).
- Every API response uses the ASIN envelope: lists → `{"data": [...], "meta": {"page","limit","total"}}`; single resource → `{"data": {...}}`; errors → `{"error": {"code","message","status"}}`.
- Routes versioned under `/api/v1`, resource names plural, HTTP verbs carry the action, nesting max 2 levels (ASIN `standards-dev.md`).
- **JSON keys are camelCase** (project decision: the API is consumed by a TypeScript frontend, camelCase is its idiom, even though Eloquent columns stay snake_case internally — resources translate at the boundary).
- Naming: intention not implementation (`getUserById()` not `selectFromDb()`), zero abbreviations, `is`/`has`/`can` for booleans (ASIN `standards-dev.md`).
- Conventional Commits on every commit (`feat`, `fix`, `test`, `chore`, `docs`).
- **Each Task below = one GitHub issue + one branch `type/PORTFOLIO-{issue#}-{description-kebab-case}` + one PR into `develop`**, per `CONTRIBUTING.md`. Create the issue and branch before Step 1 of a Task; open the PR and merge it (self-review checklist, no external reviewer needed per documented deviation) after the Task's last step.
- No secrets in code — everything through `.env`, documented in `.env.example`.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `backend/` (Laravel skeleton via Composer)
- Create: `backend/.env.example` (modify the generated one)
- Test: `backend/tests/Feature/HealthCheckTest.php`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a bootable Laravel app at `backend/`, Pest configured and runnable via `php artisan test`, SQLite dev DB, Filament package installed (panel wired in Task 2 config, admin resources start in Task 3)

- [ ] **Step 1: Create the GitHub issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Scaffold du backend Laravel" \
  --body "Initialiser backend/ : Laravel 12, Filament, Pest, SQLite dev. Réf. spec 2026-08-20."
# note le numéro d'issue retourné (ex: #3), puis :
git checkout develop && git pull origin develop
git checkout -b feature/PORTFOLIO-<issue#>-laravel-scaffold
```

- [ ] **Step 2: Scaffold Laravel**

```bash
composer create-project laravel/laravel:^12.0 backend
cd backend
```

- [ ] **Step 3: Configure SQLite for local dev**

```bash
touch database/database.sqlite
```

Edit `backend/.env` (created by the installer) — replace the `DB_*` block:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
```

Edit `backend/.env.example` the same way, but leave `DB_DATABASE` relative (`database/database.sqlite`) since it's the template committed to Git — never commit the real `.env`.

- [ ] **Step 4: Install Pest**

```bash
composer require pestphp/pest pestphp/pest-plugin-laravel --dev --with-all-dependencies
php artisan pest:install
```

- [ ] **Step 5: Write the health-check test**

Create `backend/tests/Feature/HealthCheckTest.php`:

```php
<?php

test('the health check route responds successfully', function () {
    $response = $this->get('/up');

    $response->assertStatus(200);
});
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `php artisan test --filter=HealthCheckTest`
Expected: PASS (Laravel 12 ships the `/up` route by default via `bootstrap/app.php`)

- [ ] **Step 7: Install Filament**

```bash
composer require filament/filament -W
php artisan filament:install --panels
php artisan make:filament-user --name="Elisée Atonde" --email=admin@moi.portfolio.test --password=change-me-please
```

- [ ] **Step 8: Commit, push, open the PR, merge**

```bash
git add -A
git commit -m "chore(backend): scaffold Laravel app with Pest and Filament"
git push -u origin feature/PORTFOLIO-<issue#>-laravel-scaffold
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Scaffold du backend Laravel" \
  --body "## Objectif
Initialiser backend/ (Laravel 12, Filament, Pest, SQLite dev). Réf. #<issue#>

## Changements
- [x] Scaffold Laravel 12 dans backend/
- [x] SQLite configuré pour le dev
- [x] Pest installé, test /up qui passe
- [x] Filament installé, panneau admin + utilisateur créés

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 2: Security headers middleware

**Files:**
- Create: `backend/app/Http/Middleware/SecurityHeaders.php`
- Modify: `backend/bootstrap/app.php`
- Test: `backend/tests/Feature/SecurityHeadersTest.php`

**Interfaces:**
- Consumes: Task 1's bootable app
- Produces: every HTTP response (API and Filament admin) carries `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` — later tasks don't need to think about this again, it's global

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Middleware d'en-têtes de sécurité" \
  --body "Appliquer des en-têtes de sécurité HTTP globaux (X-Content-Type-Options, X-Frame-Options, Referrer-Policy), même principe que sur caisse-depenses."
git checkout -b feature/PORTFOLIO-<issue#>-security-headers
```

- [ ] **Step 2: Write the failing test**

Create `backend/tests/Feature/SecurityHeadersTest.php`:

```php
<?php

test('responses carry the standard security headers', function () {
    $response = $this->get('/up');

    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'DENY');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `php artisan test --filter=SecurityHeadersTest`
Expected: FAIL — headers absent

- [ ] **Step 4: Write the middleware**

Create `backend/app/Http/Middleware/SecurityHeaders.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
```

- [ ] **Step 5: Register the middleware globally**

Modify `backend/bootstrap/app.php` — inside the `->withMiddleware(function (Middleware $middleware) { ... })` callback, add:

```php
$middleware->append(\App\Http\Middleware\SecurityHeaders::class);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `php artisan test --filter=SecurityHeadersTest`
Expected: PASS

- [ ] **Step 7: Run the full suite, commit, push, PR, merge**

```bash
php artisan test
git add -A
git commit -m "feat(security): add global security headers middleware"
git push -u origin feature/PORTFOLIO-<issue#>-security-headers
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Middleware d'en-têtes de sécurité" \
  --body "## Objectif
En-têtes de sécurité HTTP globaux. Réf. #<issue#>

## Changements
- [x] SecurityHeaders middleware, appliqué globalement

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 3: Setting (singleton config)

**Files:**
- Create: `backend/database/migrations/xxxx_xx_xx_xxxxxx_create_settings_table.php` (exact name generated by `artisan make:migration`, timestamp will differ from this placeholder pattern)
- Create: `backend/app/Models/Setting.php`
- Create: `backend/app/Http/Controllers/Api/V1/SettingController.php`
- Create: `backend/routes/api.php` (modify the generated stub)
- Create: `backend/app/Filament/Pages/ManageSettings.php`
- Test: `backend/tests/Feature/Api/SettingApiTest.php`

**Interfaces:**
- Consumes: Task 1 (app), Task 2 (headers apply automatically, no code interaction needed)
- Produces: `Setting::get(string $key, mixed $default = null): mixed` and `Setting::set(string $key, mixed $value): void`, static helpers later tasks may reuse; `GET /api/v1/settings` → `{"data": {"availableForWork": bool}}`

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Réglage disponibilité (Setting)" \
  --body "Table de réglages clé/valeur + endpoint public availableForWork + page Filament pour le piloter."
git checkout -b feature/PORTFOLIO-<issue#>-settings
```

- [ ] **Step 2: Create and inspect the migration**

```bash
php artisan make:migration create_settings_table
```

Replace the generated file's `up()`/`down()` in `backend/database/migrations/..._create_settings_table.php`:

```php
public function up(): void
{
    Schema::create('settings', function (Blueprint $table) {
        $table->id();
        $table->string('key')->unique();
        $table->text('value')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('settings');
}
```

- [ ] **Step 3: Run the migration**

Run: `php artisan migrate`
Expected: `settings` table created

- [ ] **Step 4: Write the failing API test**

Create `backend/tests/Feature/Api/SettingApiTest.php`:

```php
<?php

use App\Models\Setting;

test('settings endpoint defaults availableForWork to true when unset', function () {
    $response = $this->getJson('/api/v1/settings');

    $response->assertOk()
        ->assertJson(['data' => ['availableForWork' => true]]);
});

test('settings endpoint reflects a stored false value', function () {
    Setting::set('available_for_work', 'false');

    $response = $this->getJson('/api/v1/settings');

    $response->assertOk()
        ->assertJson(['data' => ['availableForWork' => false]]);
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `php artisan test --filter=SettingApiTest`
Expected: FAIL — route/model/controller don't exist yet

- [ ] **Step 6: Write the model**

Create `backend/app/Models/Setting.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
```

- [ ] **Step 7: Write the controller**

Create `backend/app/Http/Controllers/Api/V1/SettingController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => [
                'availableForWork' => filter_var(
                    Setting::get('available_for_work', 'true'),
                    FILTER_VALIDATE_BOOLEAN
                ),
            ],
        ]);
    }
}
```

Note on the ASIN "resource in the URL is plural" rule: `/settings` here is a deliberate exception — it is a singleton configuration resource, not a collection, so there is no `/settings/{id}`. Documented here as the decision, per the ASIN principle that a deviation must be explicit rather than silent.

- [ ] **Step 8: Wire the route**

Replace the contents of `backend/routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\V1\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/settings', [SettingController::class, 'show']);
});
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `php artisan test --filter=SettingApiTest`
Expected: PASS

- [ ] **Step 10: Add the Filament settings page**

```bash
php artisan make:filament-page ManageSettings --type=Filament\\Pages\\Page
```

Replace `backend/app/Filament/Pages/ManageSettings.php`:

```php
<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Pages\Page;
use Filament\Notifications\Notification;

class ManageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'Réglages';
    protected static string $view = 'filament.pages.manage-settings';

    public bool $availableForWork = true;

    public function mount(): void
    {
        $this->availableForWork = filter_var(
            Setting::get('available_for_work', 'true'),
            FILTER_VALIDATE_BOOLEAN
        );
    }

    public function form(Forms\Form $form): Forms\Form
    {
        return $form->schema([
            Forms\Components\Toggle::make('availableForWork')
                ->label('Disponible pour de nouveaux mandats'),
        ])->statePath('data');
    }

    protected function getFormStatePath(): string
    {
        return 'data';
    }

    public function save(): void
    {
        Setting::set('available_for_work', $this->availableForWork ? 'true' : 'false');

        Notification::make()->title('Réglages enregistrés')->success()->send();
    }
}
```

Create `backend/resources/views/filament/pages/manage-settings.blade.php`:

```blade
<x-filament-panels::page>
    <form wire:submit="save">
        {{ $this->form }}

        <x-filament::button type="submit" class="mt-4">
            Enregistrer
        </x-filament::button>
    </form>
</x-filament-panels::page>
```

- [ ] **Step 11: Run the full suite, commit, push, PR, merge**

```bash
php artisan test
git add -A
git commit -m "feat(settings): add availableForWork setting with public endpoint and admin page"
git push -u origin feature/PORTFOLIO-<issue#>-settings
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Réglage disponibilité" \
  --body "## Objectif
Réglage clé/valeur piloté depuis l'admin, exposé en lecture publique. Réf. #<issue#>

## Changements
- [x] Table settings, modèle Setting::get/set
- [x] GET /api/v1/settings
- [x] Page Filament ManageSettings

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 4: Project (core entity)

**Files:**
- Create: `backend/database/migrations/xxxx_xx_xx_xxxxxx_create_projects_table.php` (exact name generated by `artisan make:migration`)
- Create: `backend/app/Enums/ProjectCategory.php`
- Create: `backend/app/Enums/ProjectStatus.php`
- Create: `backend/app/Models/Project.php`
- Create: `backend/database/factories/ProjectFactory.php`
- Create: `backend/app/Http/Resources/ProjectResource.php`
- Create: `backend/app/Http/Controllers/Api/V1/ProjectController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/app/Filament/Resources/ProjectResource.php` + `ProjectResource/Pages/*`
- Test: `backend/tests/Feature/Api/ProjectApiTest.php`
- Test: `backend/tests/Unit/ProjectTest.php`

**Interfaces:**
- Consumes: Task 1, Task 2
- Produces: `Project` model with `$fillable`, casts (`category` → `ProjectCategory`, `status` → `ProjectStatus`, `stack`/`screenshots` → array), `hasCompleteTranslations(): bool`, `isPublished(): bool`; `ProjectResource` producing keys `id, slug, category, title{fr,en}, tagline{fr,en}, summary{fr,en}, body{fr,en}, clientName, stack[], role, screenshots[], liveUrl, repoUrl, featured, testimonials[]`; `GET /api/v1/projects` and `GET /api/v1/projects/{slug}` — Task 5 (Testimonial) modifies this task's `show()` and `ProjectResource`

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Entité Project (modèle, API, admin)" \
  --body "Cœur du contenu : projets bilingues FR/EN, catégorie, garde-fou de publication, endpoints publics, admin Filament."
git checkout -b feature/PORTFOLIO-<issue#>-project-entity
```

- [ ] **Step 2: Migration**

```bash
php artisan make:migration create_projects_table
```

Replace the generated file's `up()`/`down()`:

```php
public function up(): void
{
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('slug')->unique();
        $table->string('category');
        $table->string('status')->default('brouillon');
        $table->string('title_fr');
        $table->string('title_en');
        $table->string('tagline_fr');
        $table->string('tagline_en');
        $table->text('summary_fr');
        $table->text('summary_en');
        $table->longText('body_fr');
        $table->longText('body_en');
        $table->string('client_name')->nullable();
        $table->boolean('client_display')->default(false);
        $table->json('stack')->nullable();
        $table->string('role')->nullable();
        $table->json('screenshots')->nullable();
        $table->string('live_url')->nullable();
        $table->string('repo_url')->nullable();
        $table->boolean('featured')->default(false);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('projects');
}
```

- [ ] **Step 3: Run the migration**

Run: `php artisan migrate`
Expected: `projects` table created

- [ ] **Step 4: Enums**

Create `backend/app/Enums/ProjectCategory.php`:

```php
<?php

namespace App\Enums;

enum ProjectCategory: string
{
    case ProduitBytechnum = 'produit_bytechnum';
    case MandatClient = 'mandat_client';

    public function label(): string
    {
        return match ($this) {
            self::ProduitBytechnum => 'Produit ByTechnum',
            self::MandatClient => 'Mandat client',
        };
    }
}
```

Create `backend/app/Enums/ProjectStatus.php`:

```php
<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Brouillon = 'brouillon';
    case Publie = 'publie';

    public function label(): string
    {
        return match ($this) {
            self::Brouillon => 'Brouillon',
            self::Publie => 'Publié',
        };
    }
}
```

- [ ] **Step 5: Write the failing unit test for the content guard**

Create `backend/tests/Unit/ProjectTest.php`:

```php
<?php

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Validation\ValidationException;

test('a project cannot be published with incomplete translations', function () {
    expect(fn () => Project::create([
        'slug' => 'incomplet',
        'category' => ProjectCategory::ProduitBytechnum,
        'status' => ProjectStatus::Publie,
        'title_fr' => 'Titre',
        'title_en' => '',
        'tagline_fr' => 'Accroche',
        'tagline_en' => 'Tagline',
        'summary_fr' => 'Résumé',
        'summary_en' => 'Summary',
        'body_fr' => 'Corps',
        'body_en' => 'Body',
        'screenshots' => ['projects/shot.png'],
    ]))->toThrow(ValidationException::class);
});

test('a project cannot be published without at least one screenshot', function () {
    expect(fn () => Project::create([
        'slug' => 'sans-capture',
        'category' => ProjectCategory::ProduitBytechnum,
        'status' => ProjectStatus::Publie,
        'title_fr' => 'Titre', 'title_en' => 'Title',
        'tagline_fr' => 'Accroche', 'tagline_en' => 'Tagline',
        'summary_fr' => 'Résumé', 'summary_en' => 'Summary',
        'body_fr' => 'Corps', 'body_en' => 'Body',
        'screenshots' => null,
    ]))->toThrow(ValidationException::class);
});

test('a complete project can be published', function () {
    $project = Project::create([
        'slug' => 'complet',
        'category' => ProjectCategory::ProduitBytechnum,
        'status' => ProjectStatus::Publie,
        'title_fr' => 'Titre', 'title_en' => 'Title',
        'tagline_fr' => 'Accroche', 'tagline_en' => 'Tagline',
        'summary_fr' => 'Résumé', 'summary_en' => 'Summary',
        'body_fr' => 'Corps', 'body_en' => 'Body',
        'screenshots' => ['projects/shot.png'],
    ]);

    expect($project->isPublished())->toBeTrue();
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `php artisan test --filter=ProjectTest`
Expected: FAIL — `Project` model doesn't exist yet

- [ ] **Step 7: Write the model**

Create `backend/app/Models/Project.php`:

```php
<?php

namespace App\Models;

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'category', 'status',
        'title_fr', 'title_en',
        'tagline_fr', 'tagline_en',
        'summary_fr', 'summary_en',
        'body_fr', 'body_en',
        'client_name', 'client_display',
        'stack', 'role', 'screenshots',
        'live_url', 'repo_url', 'featured',
    ];

    protected $casts = [
        'category' => ProjectCategory::class,
        'status' => ProjectStatus::class,
        'client_display' => 'boolean',
        'featured' => 'boolean',
        'stack' => 'array',
        'screenshots' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (Project $project) {
            if ($project->status !== ProjectStatus::Publie) {
                return;
            }

            if (! $project->hasCompleteTranslations()) {
                throw ValidationException::withMessages([
                    'status' => "Impossible de publier : les champs FR et EN doivent être complets.",
                ]);
            }

            if (blank($project->screenshots)) {
                throw ValidationException::withMessages([
                    'status' => "Impossible de publier : au moins une capture d'écran est requise.",
                ]);
            }
        });
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    public function isPublished(): bool
    {
        return $this->status === ProjectStatus::Publie;
    }

    public function hasCompleteTranslations(): bool
    {
        return filled($this->title_fr) && filled($this->title_en)
            && filled($this->tagline_fr) && filled($this->tagline_en)
            && filled($this->summary_fr) && filled($this->summary_en)
            && filled($this->body_fr) && filled($this->body_en);
    }
}
```

`blank()` and `filled()` used above are global Laravel helpers — no import needed for either.

- [ ] **Step 8: Run tests to verify they pass**

Run: `php artisan test --filter=ProjectTest`
Expected: PASS (3 tests)

- [ ] **Step 9: Factory (needed by the API tests in the next steps)**

Create `backend/database/factories/ProjectFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => $this->faker->unique()->slug(3),
            'category' => ProjectCategory::ProduitBytechnum,
            'status' => ProjectStatus::Publie,
            'title_fr' => $this->faker->sentence(3),
            'title_en' => $this->faker->sentence(3),
            'tagline_fr' => $this->faker->sentence(6),
            'tagline_en' => $this->faker->sentence(6),
            'summary_fr' => $this->faker->paragraph(),
            'summary_en' => $this->faker->paragraph(),
            'body_fr' => $this->faker->paragraphs(3, true),
            'body_en' => $this->faker->paragraphs(3, true),
            'client_name' => $this->faker->company(),
            'client_display' => true,
            'stack' => ['Laravel', 'Next.js'],
            'role' => 'Développeur full-stack',
            'screenshots' => ['projects/placeholder.png'],
            'live_url' => $this->faker->url(),
            'repo_url' => null,
            'featured' => false,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ProjectStatus::Brouillon]);
    }

    public function featured(): static
    {
        return $this->state(['featured' => true]);
    }
}
```

- [ ] **Step 10: Write the failing API test**

Create `backend/tests/Feature/Api/ProjectApiTest.php`:

```php
<?php

use App\Enums\ProjectStatus;
use App\Models\Project;

test('projects index only returns published projects, newest featured first, with pagination meta', function () {
    Project::factory()->count(2)->create();
    Project::factory()->draft()->create();

    $response = $this->getJson('/api/v1/projects');

    $response->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'slug', 'category', 'title' => ['fr', 'en'], 'clientName', 'stack', 'screenshots']],
            'meta' => ['page', 'limit', 'total'],
        ])
        ->assertJsonPath('meta.total', 2);
});

test('projects index hides the client name when client_display is false', function () {
    Project::factory()->create(['client_name' => 'CAFAB', 'client_display' => false]);

    $response = $this->getJson('/api/v1/projects');

    $response->assertOk()->assertJsonPath('data.0.clientName', null);
});

test('project show returns the full payload for a published slug', function () {
    $project = Project::factory()->create(['slug' => 'oeil-360-finance']);

    $response = $this->getJson('/api/v1/projects/oeil-360-finance');

    $response->assertOk()->assertJsonPath('data.slug', 'oeil-360-finance');
});

test('project show returns a 404 envelope for an unknown slug', function () {
    $response = $this->getJson('/api/v1/projects/inconnu');

    $response->assertStatus(404)
        ->assertJsonPath('error.code', 'PROJECT_NOT_FOUND');
});

test('project show returns a 404 for a draft project', function () {
    Project::factory()->draft()->create(['slug' => 'brouillon']);

    $response = $this->getJson('/api/v1/projects/brouillon');

    $response->assertStatus(404);
});
```

- [ ] **Step 11: Run tests to verify they fail**

Run: `php artisan test --filter=ProjectApiTest`
Expected: FAIL — resource/controller/route don't exist yet

- [ ] **Step 12: Write the API resource**

Create `backend/app/Http/Resources/ProjectResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'slug' => $this->slug,
            'category' => $this->category->value,
            'title' => ['fr' => $this->title_fr, 'en' => $this->title_en],
            'tagline' => ['fr' => $this->tagline_fr, 'en' => $this->tagline_en],
            'summary' => ['fr' => $this->summary_fr, 'en' => $this->summary_en],
            'body' => ['fr' => $this->body_fr, 'en' => $this->body_en],
            'clientName' => $this->client_display ? $this->client_name : null,
            'stack' => $this->stack ?? [],
            'role' => $this->role,
            'screenshots' => $this->screenshots ?? [],
            'liveUrl' => $this->live_url,
            'repoUrl' => $this->repo_url,
            'featured' => $this->featured,
            'testimonials' => [],
        ];
    }
}
```

(`testimonials` stays a hardcoded empty array until Task 5 adds the relation — keeps this task's contract stable and testable on its own.)

- [ ] **Step 13: Write the controller**

Create `backend/app/Http/Controllers/Api/V1/ProjectController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 20), 100);
        $page = max((int) $request->query('page', 1), 1);

        $query = Project::query()
            ->where('status', ProjectStatus::Publie)
            ->orderByDesc('featured')
            ->orderBy('id');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $total = $query->count();
        $projects = $query->forPage($page, $limit)->get();

        return response()->json([
            'data' => ProjectResource::collection($projects),
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()
            ->where('slug', $slug)
            ->where('status', ProjectStatus::Publie)
            ->first();

        if (! $project) {
            return response()->json([
                'error' => [
                    'code' => 'PROJECT_NOT_FOUND',
                    'message' => 'Projet introuvable.',
                    'status' => 404,
                ],
            ], 404);
        }

        return response()->json([
            'data' => new ProjectResource($project),
        ]);
    }
}
```

- [ ] **Step 14: Wire the routes**

Modify `backend/routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/settings', [SettingController::class, 'show']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
});
```

- [ ] **Step 15: Run tests to verify they pass**

Run: `php artisan test --filter=ProjectApiTest`
Expected: PASS (5 tests)

- [ ] **Step 16: Filament admin resource**

```bash
php artisan make:filament-resource Project --generate
```

Replace `backend/app/Filament/Resources/ProjectResource.php` (keep the auto-generated `Pages` sub-namespace files as-is, only replace this file):

```php
<?php

namespace App\Filament\Resources;

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use App\Filament\Resources\ProjectResource\Pages;
use App\Models\Project;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;
    protected static ?string $navigationIcon = 'heroicon-o-briefcase';
    protected static ?string $navigationLabel = 'Projets';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Identité')->columns(2)->schema([
                Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Forms\Components\Select::make('category')->required()->options([
                    ProjectCategory::ProduitBytechnum->value => 'Produit ByTechnum',
                    ProjectCategory::MandatClient->value => 'Mandat client',
                ]),
                Forms\Components\Select::make('status')->required()->default(ProjectStatus::Brouillon->value)->options([
                    ProjectStatus::Brouillon->value => 'Brouillon',
                    ProjectStatus::Publie->value => 'Publié',
                ]),
                Forms\Components\Toggle::make('featured')->label("Mis en avant sur la page d'accueil"),
            ]),

            Forms\Components\Section::make('Contenu — Français')->schema([
                Forms\Components\TextInput::make('title_fr')->label('Titre (FR)')->required(),
                Forms\Components\TextInput::make('tagline_fr')->label('Accroche (FR)')->required(),
                Forms\Components\Textarea::make('summary_fr')->label('Résumé (FR)')->required(),
                Forms\Components\Textarea::make('body_fr')->label("Corps de l'étude de cas (FR)")->required()->rows(10),
            ]),

            Forms\Components\Section::make('Contenu — Anglais')->schema([
                Forms\Components\TextInput::make('title_en')->label('Titre (EN)')->required(),
                Forms\Components\TextInput::make('tagline_en')->label('Accroche (EN)')->required(),
                Forms\Components\Textarea::make('summary_en')->label('Résumé (EN)')->required(),
                Forms\Components\Textarea::make('body_en')->label("Corps de l'étude de cas (EN)")->required()->rows(10),
            ]),

            Forms\Components\Section::make('Client & preuve')->columns(2)->schema([
                Forms\Components\TextInput::make('client_name')->label('Nom du client'),
                Forms\Components\Toggle::make('client_display')->label('Afficher le nom publiquement'),
                Forms\Components\TagsInput::make('stack')->label('Stack technique'),
                Forms\Components\TextInput::make('role'),
                Forms\Components\FileUpload::make('screenshots')
                    ->label("Captures d'écran")
                    ->multiple()
                    ->image()
                    ->disk('public')
                    ->directory('projects'),
                Forms\Components\TextInput::make('live_url')->label('Lien démo')->url(),
                Forms\Components\TextInput::make('repo_url')->label('Lien dépôt')->url(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title_fr')->label('Titre')->searchable(),
                Tables\Columns\TextColumn::make('category')->label('Catégorie')->badge(),
                Tables\Columns\TextColumn::make('status')->label('Statut')->badge()
                    ->color(fn (ProjectStatus $state) => $state === ProjectStatus::Publie ? 'success' : 'gray'),
                Tables\Columns\IconColumn::make('featured')->label('Mis en avant')->boolean(),
                Tables\Columns\TextColumn::make('updated_at')->label('Modifié le')->dateTime('d/m/Y'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')->options([
                    ProjectCategory::ProduitBytechnum->value => 'Produit ByTechnum',
                    ProjectCategory::MandatClient->value => 'Mandat client',
                ]),
                Tables\Filters\SelectFilter::make('status')->options([
                    ProjectStatus::Brouillon->value => 'Brouillon',
                    ProjectStatus::Publie->value => 'Publié',
                ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}
```

- [ ] **Step 17: Run the full suite, commit, push, PR, merge**

```bash
php artisan test
git add -A
git commit -m "feat(projects): add Project entity with publish guard, public API, and admin"
git push -u origin feature/PORTFOLIO-<issue#>-project-entity
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Entité Project" \
  --body "## Objectif
Cœur du contenu du portfolio. Réf. #<issue#>

## Changements
- [x] Migration + modèle Project, enums catégorie/statut
- [x] Garde-fou : impossible de publier sans FR+EN complets et au moins une capture
- [x] GET /api/v1/projects, GET /api/v1/projects/{slug}
- [x] Admin Filament complet

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 5: Testimonial (relation to Project)

**Files:**
- Create: `backend/database/migrations/xxxx_xx_xx_xxxxxx_create_testimonials_table.php` (exact name generated by `artisan make:migration`)
- Create: `backend/app/Models/Testimonial.php`
- Create: `backend/database/factories/TestimonialFactory.php`
- Create: `backend/app/Http/Resources/TestimonialResource.php`
- Modify: `backend/app/Http/Resources/ProjectResource.php` (Task 4)
- Modify: `backend/app/Http/Controllers/Api/V1/ProjectController.php` (Task 4's `show()`)
- Create: `backend/app/Filament/Resources/TestimonialResource.php` + `Pages/*`
- Test: `backend/tests/Feature/Api/ProjectTestimonialsTest.php`

**Interfaces:**
- Consumes: Task 4's `Project` model, `ProjectResource`, `ProjectController::show()`
- Produces: `Testimonial` model with `project()` (BelongsTo) and `Project::testimonials()` (HasMany, already declared in Task 4); `TestimonialResource` producing `{id, authorName, authorRole, authorCompany, quote:{fr,en}}`; project show payload now nests visible testimonials

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Témoignages liés aux projets" \
  --body "Modèle Testimonial, rattaché à un projet, exposé dans l'étude de cas."
git checkout -b feature/PORTFOLIO-<issue#>-testimonials
```

- [ ] **Step 2: Migration**

```bash
php artisan make:migration create_testimonials_table
```

```php
public function up(): void
{
    Schema::create('testimonials', function (Blueprint $table) {
        $table->id();
        $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
        $table->string('author_name');
        $table->string('author_role')->nullable();
        $table->string('author_company')->nullable();
        $table->text('quote_fr');
        $table->text('quote_en');
        $table->boolean('visible')->default(true);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('testimonials');
}
```

- [ ] **Step 3: Run the migration**

Run: `php artisan migrate`
Expected: `testimonials` table created

- [ ] **Step 4: Write the failing test**

Create `backend/tests/Feature/Api/ProjectTestimonialsTest.php`:

```php
<?php

use App\Models\Project;
use App\Models\Testimonial;

test('project show nests only visible testimonials for that project', function () {
    $project = Project::factory()->create(['slug' => 'tracacajou']);
    $other = Project::factory()->create(['slug' => 'where']);

    Testimonial::factory()->for($project)->create(['author_name' => 'Visible', 'visible' => true]);
    Testimonial::factory()->for($project)->create(['author_name' => 'Caché', 'visible' => false]);
    Testimonial::factory()->for($other)->create(['author_name' => 'Autre projet']);

    $response = $this->getJson('/api/v1/projects/tracacajou');

    $response->assertOk()
        ->assertJsonCount(1, 'data.testimonials')
        ->assertJsonPath('data.testimonials.0.authorName', 'Visible');
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `php artisan test --filter=ProjectTestimonialsTest`
Expected: FAIL — `Testimonial` model/factory don't exist, `testimonials` still hardcoded to `[]`

- [ ] **Step 6: Write the model**

Create `backend/app/Models/Testimonial.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'author_name', 'author_role', 'author_company',
        'quote_fr', 'quote_en', 'visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
```

- [ ] **Step 7: Factory**

Create `backend/database/factories/TestimonialFactory.php`:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'author_name' => $this->faker->name(),
            'author_role' => $this->faker->jobTitle(),
            'author_company' => $this->faker->company(),
            'quote_fr' => $this->faker->paragraph(),
            'quote_en' => $this->faker->paragraph(),
            'visible' => true,
        ];
    }
}
```

- [ ] **Step 8: Testimonial resource**

Create `backend/app/Http/Resources/TestimonialResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'authorName' => $this->author_name,
            'authorRole' => $this->author_role,
            'authorCompany' => $this->author_company,
            'quote' => ['fr' => $this->quote_fr, 'en' => $this->quote_en],
        ];
    }
}
```

- [ ] **Step 9: Nest testimonials in the project payload**

Modify `backend/app/Http/Resources/ProjectResource.php` — replace the hardcoded `'testimonials' => [],` line with:

```php
'testimonials' => TestimonialResource::collection($this->whenLoaded('testimonials')),
```

Add the import at the top of the file: `use App\Http\Resources\TestimonialResource;` is unnecessary (same namespace) — no import needed since both resources live in `App\Http\Resources`.

- [ ] **Step 10: Eager-load visible testimonials in the controller**

Modify `backend/app/Http/Controllers/Api/V1/ProjectController.php` — replace the `show()` method's query with:

```php
public function show(string $slug): JsonResponse
{
    $project = Project::query()
        ->where('slug', $slug)
        ->where('status', ProjectStatus::Publie)
        ->with(['testimonials' => fn ($query) => $query->where('visible', true)])
        ->first();

    if (! $project) {
        return response()->json([
            'error' => [
                'code' => 'PROJECT_NOT_FOUND',
                'message' => 'Projet introuvable.',
                'status' => 404,
            ],
        ], 404);
    }

    return response()->json([
        'data' => new ProjectResource($project),
    ]);
}
```

- [ ] **Step 11: Run tests to verify they pass**

Run: `php artisan test --filter=ProjectTestimonialsTest`
Expected: PASS. Then run: `php artisan test` — expected: full suite still green (no regressions in Task 4's tests).

- [ ] **Step 12: Filament admin resource**

```bash
php artisan make:filament-resource Testimonial --generate
```

Replace `backend/app/Filament/Resources/TestimonialResource.php`:

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestimonialResource\Pages;
use App\Models\Project;
use App\Models\Testimonial;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationLabel = 'Témoignages';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('project_id')
                ->label('Projet lié')
                ->options(fn () => Project::query()->pluck('title_fr', 'id'))
                ->searchable(),
            Forms\Components\TextInput::make('author_name')->label('Nom')->required(),
            Forms\Components\TextInput::make('author_role')->label('Fonction'),
            Forms\Components\TextInput::make('author_company')->label('Entreprise'),
            Forms\Components\Textarea::make('quote_fr')->label('Citation (FR)')->required(),
            Forms\Components\Textarea::make('quote_en')->label('Citation (EN)')->required(),
            Forms\Components\Toggle::make('visible')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('author_name')->label('Nom')->searchable(),
                Tables\Columns\TextColumn::make('project.title_fr')->label('Projet'),
                Tables\Columns\IconColumn::make('visible')->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTestimonials::route('/'),
            'create' => Pages\CreateTestimonial::route('/create'),
            'edit' => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
```

- [ ] **Step 13: Run the full suite, commit, push, PR, merge**

```bash
php artisan test
git add -A
git commit -m "feat(testimonials): add Testimonial entity nested under project payload"
git push -u origin feature/PORTFOLIO-<issue#>-testimonials
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Témoignages" \
  --body "## Objectif
Témoignages rattachés à un projet. Réf. #<issue#>

## Changements
- [x] Migration + modèle Testimonial
- [x] Nesting dans la réponse project show (visibles uniquement)
- [x] Admin Filament

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 6: ContactMessage (write endpoint)

**Files:**
- Create: `backend/database/migrations/xxxx_xx_xx_xxxxxx_create_contact_messages_table.php` (exact name generated by `artisan make:migration`)
- Create: `backend/app/Models/ContactMessage.php`
- Create: `backend/app/Http/Requests/StoreContactMessageRequest.php`
- Create: `backend/app/Http/Controllers/Api/V1/ContactMessageController.php`
- Create: `backend/app/Mail/ContactMessageReceived.php`
- Create: `backend/resources/views/emails/contact-message-received.blade.php`
- Modify: `backend/config/mail.php`
- Modify: `backend/routes/api.php`
- Create: `backend/app/Filament/Resources/ContactMessageResource.php` + `Pages/*`
- Test: `backend/tests/Feature/Api/ContactMessageApiTest.php`

**Interfaces:**
- Consumes: Task 1, Task 2
- Produces: `POST /api/v1/contact-messages` → `201 {"data": {"received": true}}`; rate-limited 5/min; honeypot field `website` silently drops spam

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Formulaire de contact (endpoint + admin)" \
  --body "Endpoint public d'envoi de message, honeypot anti-spam, notification email, boîte de réception Filament."
git checkout -b feature/PORTFOLIO-<issue#>-contact-messages
```

- [ ] **Step 2: Migration**

```bash
php artisan make:migration create_contact_messages_table
```

```php
public function up(): void
{
    Schema::create('contact_messages', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->text('message');
        $table->string('project_interest')->nullable();
        $table->string('locale')->default('fr');
        $table->boolean('read')->default(false);
        $table->boolean('replied')->default(false);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('contact_messages');
}
```

- [ ] **Step 3: Run the migration**

Run: `php artisan migrate`
Expected: `contact_messages` table created

- [ ] **Step 4: Write the failing test**

Create `backend/tests/Feature/Api/ContactMessageApiTest.php`:

```php
<?php

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Mail;

test('a valid contact message is stored and notified by email', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => 'Amina Traoré',
        'email' => 'amina@example.com',
        'message' => "Bonjour, je souhaite discuter d'un mandat.",
        'projectInterest' => 'TracaCajou',
        'locale' => 'fr',
    ]);

    $response->assertStatus(201)->assertJson(['data' => ['received' => true]]);
    expect(ContactMessage::count())->toBe(1);
    Mail::assertSent(ContactMessageReceived::class);
});

test('an invalid contact message is rejected with a 422', function () {
    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => '',
        'email' => 'pas-un-email',
        'message' => '',
    ]);

    $response->assertStatus(422);
    expect(ContactMessage::count())->toBe(0);
});

test('a filled honeypot field is silently dropped without storing or notifying', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'message' => 'Spam',
        'website' => 'https://spam.example',
    ]);

    $response->assertStatus(201)->assertJson(['data' => ['received' => true]]);
    expect(ContactMessage::count())->toBe(0);
    Mail::assertNothingSent();
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `php artisan test --filter=ContactMessageApiTest`
Expected: FAIL — nothing exists yet

- [ ] **Step 6: Model**

Create `backend/app/Models/ContactMessage.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name', 'email', 'message', 'project_interest', 'locale',
    ];

    protected $casts = [
        'read' => 'boolean',
        'replied' => 'boolean',
    ];
}
```

- [ ] **Step 7: Form request**

Create `backend/app/Http/Requests/StoreContactMessageRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'message' => ['required', 'string', 'max:5000'],
            'projectInterest' => ['nullable', 'string', 'max:120'],
            'locale' => ['nullable', 'in:fr,en'],
        ];
    }
}
```

(The `website` honeypot field is intentionally left out of the validation rules — it must accept any value without failing validation, so the bot never learns it was caught. It's read directly from the request in the controller instead.)

- [ ] **Step 8: Mailable + view**

Create `backend/app/Mail/ContactMessageReceived.php`:

```php
<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMessageReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contactMessage)
    {
    }

    public function build(): self
    {
        return $this->subject('Nouveau message — moi.bytechnum.com')
            ->view('emails.contact-message-received');
    }
}
```

Create `backend/resources/views/emails/contact-message-received.blade.php`:

```blade
<p>Nouveau message reçu depuis le formulaire de contact.</p>
<p><strong>Nom :</strong> {{ $contactMessage->name }}</p>
<p><strong>Email :</strong> {{ $contactMessage->email }}</p>
@if($contactMessage->project_interest)
<p><strong>Projet concerné :</strong> {{ $contactMessage->project_interest }}</p>
@endif
<p><strong>Message :</strong></p>
<p>{{ $contactMessage->message }}</p>
```

- [ ] **Step 9: Add the recipient config key**

Modify `backend/config/mail.php` — add this line inside the returned array (top level, alongside `'default'`, `'mailers'`, etc.):

```php
'contact_recipient' => env('CONTACT_RECIPIENT_EMAIL', 'elisee.atonde@bytechnum.com'),
```

Add to `backend/.env.example`:

```env
CONTACT_RECIPIENT_EMAIL=elisee.atonde@bytechnum.com
```

- [ ] **Step 10: Controller**

Create `backend/app/Http/Controllers/Api/V1/ContactMessageController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        if (filled($request->input('website'))) {
            return response()->json(['data' => ['received' => true]], 201);
        }

        $contactMessage = ContactMessage::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'message' => $request->validated('message'),
            'project_interest' => $request->validated('projectInterest'),
            'locale' => $request->validated('locale') ?? 'fr',
        ]);

        Mail::to(config('mail.contact_recipient'))->send(new ContactMessageReceived($contactMessage));

        return response()->json(['data' => ['received' => true]], 201);
    }
}
```

- [ ] **Step 11: Wire the route with rate limiting**

Modify `backend/routes/api.php` — add inside the existing `Route::prefix('v1')->group(...)` block:

```php
Route::post('/contact-messages', [ContactMessageController::class, 'store'])
    ->middleware('throttle:5,1');
```

Add the import at the top: `use App\Http\Controllers\Api\V1\ContactMessageController;`

- [ ] **Step 12: Run tests to verify they pass**

Run: `php artisan test --filter=ContactMessageApiTest`
Expected: PASS (3 tests)

- [ ] **Step 13: Filament admin resource (read-only inbox)**

```bash
php artisan make:filament-resource ContactMessage --generate
```

Replace `backend/app/Filament/Resources/ContactMessageResource.php`:

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactMessageResource\Pages;
use App\Models\ContactMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;
    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationLabel = 'Messages';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->label('Nom')->disabled(),
            Forms\Components\TextInput::make('email')->disabled(),
            Forms\Components\Textarea::make('message')->disabled()->rows(6),
            Forms\Components\Toggle::make('read')->label('Lu'),
            Forms\Components\Toggle::make('replied')->label('Répondu'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Nom')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('created_at')->label('Reçu le')->dateTime('d/m/Y H:i'),
                Tables\Columns\IconColumn::make('read')->label('Lu')->boolean(),
                Tables\Columns\IconColumn::make('replied')->label('Répondu')->boolean(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContactMessages::route('/'),
            'edit' => Pages\EditContactMessage::route('/{record}/edit'),
        ];
    }
}
```

Note: no `create` page in `getPages()` — messages arrive only through the public endpoint, never created by hand in the admin.

- [ ] **Step 14: Run the full suite, commit, push, PR, merge**

```bash
php artisan test
git add -A
git commit -m "feat(contact): add contact message endpoint with honeypot and admin inbox"
git push -u origin feature/PORTFOLIO-<issue#>-contact-messages
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Formulaire de contact" \
  --body "## Objectif
Endpoint public de contact avec anti-spam. Réf. #<issue#>

## Changements
- [x] POST /api/v1/contact-messages, throttle 5/min
- [x] Honeypot website (drop silencieux)
- [x] Notification email
- [x] Boîte de réception Filament (lecture seule)

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 7: OpenAPI documentation

**Files:**
- Create: `backend/openapi.yaml`
- Test: `backend/tests/Feature/OpenApiSpecTest.php`

**Interfaces:**
- Consumes: the exact routes/payloads from Tasks 3, 4, 5, 6
- Produces: `backend/openapi.yaml`, the authoritative contract per ASIN standard ("le contrat API prime sur tout — même sur le code")

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Documentation OpenAPI de l'API publique" \
  --body "openapi.yaml versionné couvrant les 4 endpoints publics, conforme au standard ASIN (le contrat prime sur le code)."
git checkout -b feature/PORTFOLIO-<issue#>-openapi-spec
```

- [ ] **Step 2: Write the failing test (the file must exist and be valid YAML with the right paths)**

Create `backend/tests/Feature/OpenApiSpecTest.php`:

```php
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `php artisan test --filter=OpenApiSpecTest`
Expected: FAIL — file doesn't exist

- [ ] **Step 4: Write the OpenAPI document**

Create `backend/openapi.yaml`:

```yaml
openapi: 3.0.3
info:
  title: moi.bytechnum.com API
  version: "1.0"
  description: API publique consommée par le frontend Next.js du portfolio ByTechnum.
servers:
  - url: https://moi.bytechnum.com/api
paths:
  /v1/projects:
    get:
      summary: Liste des projets publiés
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
        - name: category
          in: query
          schema: { type: string, enum: [produit_bytechnum, mandat_client] }
      responses:
        "200":
          description: Liste paginée
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: "#/components/schemas/Project" }
                  meta: { $ref: "#/components/schemas/Meta" }
  /v1/projects/{slug}:
    get:
      summary: Détail d'un projet publié
      parameters:
        - name: slug
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Projet trouvé
          content:
            application/json:
              schema:
                type: object
                properties:
                  data: { $ref: "#/components/schemas/Project" }
        "404":
          description: Projet introuvable ou non publié
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Error" }
  /v1/settings:
    get:
      summary: Réglages publics (disponibilité)
      responses:
        "200":
          description: Réglages courants
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      availableForWork: { type: boolean }
  /v1/contact-messages:
    post:
      summary: Envoi d'un message de contact
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, email, message]
              properties:
                name: { type: string, maxLength: 120 }
                email: { type: string, format: email, maxLength: 180 }
                message: { type: string, maxLength: 5000 }
                projectInterest: { type: string, maxLength: 120, nullable: true }
                locale: { type: string, enum: [fr, en] }
      responses:
        "201":
          description: Message reçu (aussi renvoyé silencieusement si le honeypot est rempli)
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      received: { type: boolean }
        "422":
          description: Validation échouée
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Error" }
components:
  schemas:
    LocalizedText:
      type: object
      properties:
        fr: { type: string }
        en: { type: string }
    Project:
      type: object
      properties:
        id: { type: string }
        slug: { type: string }
        category: { type: string, enum: [produit_bytechnum, mandat_client] }
        title: { $ref: "#/components/schemas/LocalizedText" }
        tagline: { $ref: "#/components/schemas/LocalizedText" }
        summary: { $ref: "#/components/schemas/LocalizedText" }
        body: { $ref: "#/components/schemas/LocalizedText" }
        clientName: { type: string, nullable: true }
        stack:
          type: array
          items: { type: string }
        role: { type: string, nullable: true }
        screenshots:
          type: array
          items: { type: string }
        liveUrl: { type: string, nullable: true }
        repoUrl: { type: string, nullable: true }
        featured: { type: boolean }
        testimonials:
          type: array
          items: { $ref: "#/components/schemas/Testimonial" }
    Testimonial:
      type: object
      properties:
        id: { type: string }
        authorName: { type: string }
        authorRole: { type: string, nullable: true }
        authorCompany: { type: string, nullable: true }
        quote: { $ref: "#/components/schemas/LocalizedText" }
    Meta:
      type: object
      properties:
        page: { type: integer }
        limit: { type: integer }
        total: { type: integer }
    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code: { type: string }
            message: { type: string }
            status: { type: integer }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `php artisan test --filter=OpenApiSpecTest`
Expected: PASS

- [ ] **Step 6: Run the full suite, commit, push, PR, merge**

```bash
php artisan test
git add -A
git commit -m "docs(api): add openapi.yaml covering all public endpoints"
git push -u origin feature/PORTFOLIO-<issue#>-openapi-spec
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Documentation OpenAPI" \
  --body "## Objectif
Contrat API versionné, conforme au standard ASIN. Réf. #<issue#>

## Changements
- [x] openapi.yaml pour les 4 endpoints publics

## Tests
- [x] php artisan test

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

### Task 8: Continuous integration

**Files:**
- Create: `backend/.github/workflows/backend-ci.yml` — actually create at repo root `.github/workflows/backend-ci.yml` since GitHub Actions only reads workflows from the repository root's `.github/` directory, not from `backend/.github/`

**Interfaces:**
- Consumes: Task 1's Pest setup, Tasks 3-7's full test suite
- Produces: a GitHub Actions workflow gating every PR into `develop`/`main` on `backend/**` changes — no new application code

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "CI backend (tests + scan de secrets)" \
  --body "Pipeline GitHub Actions sur backend/** : php artisan test + gitleaks, même pratique que sur oeil-360-finance et caisse-depenses."
git checkout -b feature/PORTFOLIO-<issue#>-backend-ci
```

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/backend-ci.yml` (repo root, not inside `backend/`):

```yaml
name: Backend CI

on:
  pull_request:
    branches: [main, develop]
    paths: ['backend/**']
  push:
    branches: [main, develop]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, sqlite3, pdo_sqlite

      - name: Install dependencies
        run: composer install --no-interaction --prefer-dist

      - name: Prepare environment
        run: |
          cp .env.example .env
          php artisan key:generate
          touch database/database.sqlite

      - name: Run tests
        run: php artisan test

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 3: Verify locally that the referenced commands succeed**

Run, from `backend/`:

```bash
cp .env.example .env.ci-check
php artisan key:generate --env=ci-check
```

Expected: no error (confirms `.env.example` has every key `artisan key:generate` needs — this is a smoke check, not a real CI run, since CI only executes on GitHub)

- [ ] **Step 4: Commit, push, open the PR, merge**

```bash
rm -f backend/.env.ci-check
git add -A
git commit -m "chore(ci): add backend GitHub Actions workflow (tests + gitleaks)"
git push -u origin feature/PORTFOLIO-<issue#>-backend-ci
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] CI backend" \
  --body "## Objectif
Tests + scan de secrets sur chaque PR touchant backend/. Réf. #<issue#>

## Changements
- [x] .github/workflows/backend-ci.yml

## Tests
- [x] Vérification locale de .env.example (php artisan key:generate)

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
gh pr merge --repo Magloire04/moi.portfolio --merge --delete-branch
git checkout develop && git pull origin develop
```

---

## After this plan

The backend is a complete, independently testable deliverable: `php artisan serve` boots the API, `/admin` is a working content-management panel, `php artisan test` covers every endpoint and the publish guard. The Next.js frontend plan (written next, once this one is reviewed) will consume `GET /api/v1/projects`, `GET /api/v1/projects/{slug}`, `GET /api/v1/settings`, and `POST /api/v1/contact-messages` exactly as documented in `backend/openapi.yaml`.
