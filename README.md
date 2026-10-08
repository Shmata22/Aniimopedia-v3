# Aniimopédia — version finale

Cette version est conçue pour GitHub Pages **sans aucun sous-dossier**.

Fichiers à placer directement à la racine :
- index.html
- styles.css
- app.js
- aniimo.json

## Données
Le Wiki officiel Aniimo recense actuellement 81 entrées de l'index principal : #001 à #029 puis #031 à #082. Le #030 n'est pas présent dans l'index officiel. Cinq entrées spéciales sont conservées séparément.

Les informations inconnues restent `???`. Aucun champ n'est inventé.

## Images
Les champs `image` sont volontairement simples :
`001.webp`, `002.webp`, etc.

Pour ajouter les illustrations officielles localement, il suffit de déposer les fichiers correspondants à la racine. L'application les associe automatiquement au bon numéro.

## Collection
La progression est sauvegardée dans localStorage.
- capture / retrait
- favoris
- export JSON
- import JSON
- recherche
- filtres
- fiches détaillées
- entrées spéciales

## État initial
L'index est préconfiguré avec #001 à #081 comme capturés et #082 comme non capturé, ce qui correspond à une collection allant jusqu'au numéro 081. Cet état peut être modifié dans l'application.

Source de référence : Wiki officiel Aniimo — https://wiki.aniimo.com/fr/
