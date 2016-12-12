# Groupin back-end

Serveur REST API pour notre application platine Groupin. Ce serveur est développé avec les technologies suivantes :

    -   NodeJs
    -   ExpressJS
    -   Firebase

## API REST

### USERS

    -   POST:   /users
    {
            "displayName"   :   "uid de la personne ayant demandé l'ajout",
            "email" :   "uid de la personne ayant reçue la demande d'ajout"
            "photoURL"  :   "uid de la personne ayant reçue la demande d'ajout"
            "providerId"    :   "uid de la personne ayant reçue la demande d'ajout"
            "uid"   :   "uid de la personne ayant reçue la demande d'ajout"
    }
    -   GET:    /users/:uid

    :uid    est l'uid de l'utilisateur

    -   GET:    /users


### FRIENDS

    -   POST:   /friends
    {
        "uidD"  :   "uid de la personne ayant demandé l'ajout",
        "uidR"  :   "uid de la personne ayant reçue la demande d'ajout"
    }
    -   GET:    /friends/:uid

        :uid    est l'utilisateur

### NOTIFICATIONS

    -   POST:   /notifications_amis
    {
            "uidD"  :   "uid de la personne ayant demandé l'ajout",
            "uidR"  :   "uid de la personne ayant reçue la demande d'ajout"
    }
    -   GET:    /notifications_amis/:uid

    :uid    est l'uid de l'utilisateur

    -   GET:    /notifications_amis/:uid/:ami

    :uid    est l'uid de l'utilisateur
    :ami    est l'uid de l'ami qui a fait la demande d'ajout

    Remarque : Cette dernière sert uniquement pour la suppression de la notificiation sans ajout d'amis