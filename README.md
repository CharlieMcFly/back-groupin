# Groupin back-end

Serveur REST API pour notre application platine Groupin. Ce serveur est développé avec les technologies suivantes :

    -   NodeJs
    -   ExpressJS
    -   MongoDB
    -   Mongoose
    -   Passport

## Usecases

### S'authentifier

Pour s'authentifier nous avons laisser différentes API pour le client.

#### POST
- /signup -> pour l'enregistrement avec email & password
- /login -> pour se connecter avec email & password

Arguments du post
{
    "email" : "mon email",
    "password" : "mon password"
}

#### GET
- /auth/facebook -> pour se connecter avec facebook
- /auth/google -> pour se connecter avec google
- /profile -> pour récupérer les informations de la personne authentifié
