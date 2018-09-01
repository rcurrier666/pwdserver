# Passwd as a Service

The following methods are provided:

## GET /users

Return a list of all users on the system, as defined in the /etc/passwd file.
Example Response:
```
    [
    {“name”: “root”, “uid”: 0, “gid”: 0, “comment”: “root”, “home”: “/root”, “shell”: “/bin/bash”},
    {“name”: “dwoodlins”, “uid”: 1001, “gid”: 1001, “comment”: “”, “home”:“/home/dwoodlins”, “shell”: “/bin/false”}
    ]
```
## GET

## /users/query[?name=<nq>][&uid=<uq>][&gid=<gq>][&comment=<cq>][&home=<
## hq>][&shell=<sq>]

Return a list of users matching all of the specified query fields. The bracket notation indicates that any of the
following query parameters may be supplied:

- name
- uid
- gid
- comment
- home
- shell

Only exact matches need to be supported.
Example Query: ​GET /users/query?shell=%2Fbin%2Ffalse
Example Response:
```
    [
    {“name”: “dwoodlins”, “uid”: 1001, “gid”: 1001, “comment”: “”, “home”:
    “/home/dwoodlins”, “shell”: “/bin/false”}
    ]
```
## GET /users/<<uid>>

Return a single user with <uid>. Return 404 if <uid> is not found.
Example Response:
```
    {“name”: “dwoodlins”, “uid”: 1001, “gid”: 1001, “comment”: “”, “home”:“/home/dwoodlins”, “shell”: “/bin/false”}
```
## GET /users/<<uid>>/groups

Return all the groups for a given user.
Example Response:
```
    [
    {“name”: “docker”, “gid”: 1002, “members”: [“dwoodlins”]}
    ]
```
## GET /groups

Return a list of all groups on the system, a defined by /etc/group.
Example Response:
```
    [
    {“name”: “_analyticsusers”, “gid”: 250, “members”:[“_analyticsd’, ”_networkd”, ”_timed”]}, {“name”: “docker”, “gid”: 1002, “members”: []}
    ]
```

## GET

## /groups/query[?name=<nq>][&gid=<gq>][&member=<mq1>[&member=<mq2>][&.

## ..]]

Return a list of groups matching all of the specified query fields. The bracket notation indicates that any of the
following query parameters may be supplied:

- name
- gid
- member (repeated)

Any group containing all the specified members should be returned, i.e. when query members are a subset of
group members.
Example Query: ​```GET /groups/query?member=_analyticsd&member=_networkd```
Example Response:
```
    [
    {“name”: “_analyticsusers”, “gid”: 250, “members”:[“_analyticsd’,”_networkd”,”_timed”]}
    ]
```

## GET /groups/<gid>

Return a single group with <gid>. Return 404 if <gid> is not found.
Example Response:
```
{“name”: “docker”, “gid”: 1002, “members”: [“dwoodlins”]}
```

