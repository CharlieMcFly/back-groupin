# Groupin back-end 
[![Build Status](https://travis-ci.org/CharlieMcFly/back-groupin.svg?branch=master)](https://travis-ci.org/CharlieMcFly/back-groupin)
[![Coverage Status](https://coveralls.io/repos/github/CharlieMcFly/back-groupin/badge.svg?branch=master)](https://coveralls.io/github/CharlieMcFly/back-groupin?branch=master)

Serveur REST API pour notre application platine Groupin. Ce serveur est développé avec les technologies suivantes :

    -   NodeJs
    -   ExpressJS
    -   Firebase

## API REST

### USERS

    -   POST:   /users
    {
            "displayName"   :   "username de l'utilisateur",
            "email"         :   "email de l'utilisateur"
            "photoURL"      :   "url de la photo"
            "providerId"    :   "nom de la provenance des infos (facebook, google, autre)"
            "uid"           :   "uid de l'utilisateur"
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
