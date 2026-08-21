<p>Nouveau message reçu depuis le formulaire de contact.</p>
<p><strong>Nom :</strong> {{ $contactMessage->name }}</p>
<p><strong>Email :</strong> {{ $contactMessage->email }}</p>
@if($contactMessage->project_interest)
<p><strong>Projet concerné :</strong> {{ $contactMessage->project_interest }}</p>
@endif
<p><strong>Message :</strong></p>
<p>{{ $contactMessage->message }}</p>
