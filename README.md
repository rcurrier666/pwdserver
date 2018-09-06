# Passwd as a Service

This HTTP server exposes the user and group information on a UNIX-like system that is usually locked away in the UNIX /etc/passwd and /etc/groups files. While obviously a toy, it should be deployed with caution as it exposes potentially useful information to persons with ill-intent.

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
## GET /users/query[?name=\<nq\>][&uid=\<uq\>][&gid=\<gq\>][&comment=\<cq\>][&home=\<hq\>][&shell=\<sq\>]

Return a list of users matching all of the specified query fields. The bracket notation indicates that any of the
following query parameters may be supplied:

- name
- uid
- gid
- comment
- home
- shell

Only exact matches are supported.

Example Query: ​`GET /users/query?shell=%2Fbin%2Ffalse`

Example Response:
```
[
{“name”: “dwoodlins”, “uid”: 1001, “gid”: 1001, “comment”: “”, “home”:
“/home/dwoodlins”, “shell”: “/bin/false”}
]
```
## GET /users/\<uid\>

Return a single user with \<uid\>. Returns 404 if \<uid\> is not found.

Example Response:
```
{“name”: “dwoodlins”, “uid”: 1001, “gid”: 1001, “comment”: “”, “home”:“/home/dwoodlins”, “shell”: “/bin/false”}
```
## GET /users/\<uid\>/groups

Return all the groups for a given user.

Example Response:
```[
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

## GET /groups/query[?name=\<nq\>][&gid=\<gq\>][&member=\<mq1\>[&member=\<mq2\>][&...]]

Return a list of groups matching all of the specified query fields. The bracket notation indicates that any of the following query parameters may be supplied:

- name
- gid
- member (repeated)

Any group containing all the specified members should be returned, i.e. when query members are a subset of group members.

Example Query: ​`GET /groups/query?member=_analyticsd&member=_networkd`

Example Response:
```
[
{“name”: “_analyticsusers”, “gid”: 250, “members”:[“_analyticsd’, ”_networkd”, ”_timed”]}
]
```

## GET /groups/\<gid\>

Return a single group with \<gid\>. Return 404 if \<gid\> is not found.

Example Response:
```
{“name”: “docker”, “gid”: 1002, “members”: [“dwoodlins”]}
```

# Installation

Make sure you have a recent version of Node.js, one that supports ES6. It's been tested on both V8 and V6 releases. It's also been tested on CentOS Linux and Windows.

- Clone the repository
- cd into passwdsrv directory
- Do `npm install` to install the dependencies.
- Run `node index.js` to use the default options (see below)

# Options

```
  --help            Show help                                         [boolean]
  --version         Show version number                               [boolean]
  -d, --debug       Output excessive internal details to console      [boolean]
                                                               [default: false]
  -g, --groupfile   File path to group file                            [string]
                                                        [default: "/etc/group"]
  -n, --nowarn      Suppress system file usage warning                [boolean]
                                                               [default: false]
  -o, --outputtype  Format to use for output                           [string]
                                                      [choices: "json", "text"]
                                                              [default: "text"]
  -p, --passwdfile  File path to passwd file                           [string]
                                                       [default: "/etc/passwd"]
  --port            Port to listen on                                  [number]
                                                                [default: 3000]
```

# Tests

To run the test suite start a server with `-p testfiles/passwd -g testfiles/group -o json`. In another window run `npm test`. This will test all functions with both success and failure arguments.

If npm is aborting, you may have to run it as `sudo npm test`. This seems to be a npm issue with file permissions that they don't handle correctly.
