# Installation
```batch
git clone https://github.com/albanmartel/fiche-intervention.git
cd fiche-intervention
npm install --save-dev
```
# Lancer Fiche Intervention
```batch
npm start
```

# Génération d'exécutables
```batch
# Générer Exécutable mac OS#
npm run package-mac
# Générer Exécutable windows 32 bit OS #
npm run package-win32
# Générer Exécutable windows 64 bit OS #
npm run package-win64
# Générer Exécutable Linux 32 bit OS #
npm run package-linux32
# Générer Exécutable Linux 64 bit OS #
npm run package-linux64
```

# Traces de la réflexion sur le calcul des distances d'interventions
---------------------------------------------------------------------------------------------------------------------
requete pour google map
départ : 1 avenue des Minimes 31200 Toulouse
arrivée : 5 rue d'assalit 31500 Toulouse

https://www.google.fr/maps/dir/1+Avenue+des+Minimes,+31200+Toulouse/5+Rue+d'Assalit,+31500+Toulouse

nom db fichesIntervention.sqlite

SELECT * FROM Demande DEM,  Client CL, Adresse AD, Intervention INTERV WHERE DEM.idClient = CL.idClient And DEM.idAdresse = AD.idAdresse AND DEM.idIntervention = INTERV.idIntervention

SELECT numDemande, redacteur, date, materiel, motif, deplacement, priorite, precisions, marque, modele, dateAchat, etatGarantie, civilite, prenom, nom, telephone, batiment, code, escalier, etage, appartement, numero, typeVoie, nomVoie, complementAdresse, codePostal, Ville, technicien, datePrevue, interventionPrevue, dureePrevue, Distance FROM Demande DEM, Client CL, Adresse AD, Intervention INTERV WHERE DEM.idClient = CL.idClient And DEM.idAdresse = AD.idAdresse AND DEM.idIntervention = INTERV.idIntervention
