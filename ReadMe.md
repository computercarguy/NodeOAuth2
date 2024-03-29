# NodeOAuth2

## Eric's Gear

### By Eric Ingamells

This is a simple OAuth2/SSO API. It allows for user creation with fairly standard user data, login, logout, user logged in validation, password reset, username recovery, users can disable their own account, and email notifications of many of these functions.

Before I get very far, I need to say that I didn't write this from complete scratch. This was my first Node.JS project and my 2nd time implementing OAuth2 (the first time was several years ago in C# .Net). Naturally, I didn't know what I was doing, so I looked at a tutorial. The first one I happened to stumble on was really simple, had source code, and (most importantly) worked, so that's what I based my implementation on. I barely read the artice, but went straight to downloading the source code. Before you complain that this is just plagiarism or code stealing, I've significantly changed the code in this project, and I plan on converting it from CommonJS to TypeScript once I get the functionality fully fleshed out.

Article: https://blog.logrocket.com/implement-oauth-2-0-node-js/

GitHub repo: https://github.com/atharvadeosthale/logrocket-oauth2-article/tree/master

I currently have the basic functionality of an SSO created and working, so I'm going on to other projects. Some of these projects will require me to come back to this project and implement user permissions. Until then, this is a small little microservice that should work for most simple and some complex use cases. When I get to this point, I'll see about adding automated testing for existing functionality as well as the new permissions functionality.

I have the very beginnings of a whitelist check functionality, but it's not anywhere near complete. Please ignore it for now, or finish it if you want to use it.

As it stands, I'll call this a beta version that still needs improvements. Feel free to use this as a basis for your own version, but also use at your own risk.

## Routes

There are 2 "route" files, _authRoutes.js_ and _userRouter.js_. These handle all the RESTful endpoint creation and delegation to methods.

## Database

This currently uses MySQL in the _dbWrapper.js_ file. Other databases can be swapped out, as I swapped out the original PostGreSql implementation.

The _ericsgearlogin.sql_ file contains the database schema.

## Standalone

I made this project standalone so it could be used by multiple different projects simultaneously. I wanted to have the ability to have several of my online apps use this as a type of "single sign on". I'm not sure it'll get to a true SSO, but at least it's one username and password for all the apps.

At minimum, this project gives me a single point of entry for the apps and a single DB that has all user information.
