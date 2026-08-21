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
            'testimonials' => $this->whenLoaded('testimonials', fn () => TestimonialResource::collection($this->testimonials), []),
        ];
    }
}
