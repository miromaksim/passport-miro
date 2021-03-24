# passport-miro

[Passport](http://passportjs.org/) strategy for authenticating with [Miro](https://www.miro.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Miro in your Node.js applications.
By plugging into Passport, Miro authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/) -style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-miro

## Usage

#### Create an Application

Before using `passport-miro`, you must register an application with
Miro.  If you have not already done so, you can find instruction [here](https://developers.miro.com/docs/getting-started).  
Your application will be issued an app ID and app secret, which need to be provided to the strategy.
You will also need to configure a redirect URI which matches the route in your
application.

#### Configure Strategy

The Miro authentication strategy authenticates users using a Miro
account and OAuth 2.0 tokens.  The app ID and secret obtained when creating an
application are supplied as options when creating the strategy.  The strategy
also requires a `verify` callback, which receives the access token and
refresh token, as well as `profile` which contains the authenticated user's
Miro profile (your app have to require `identity:read` scope).  
The `verify` callback must call `cb` providing a user to complete authentication.

```js
 // how to use example
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'miro'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/miro',
  passport.authenticate('miro'));

app.get('/auth/miro/callback',
  passport.authenticate('miro', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## FAQ

##### How do I obtain a user profile with specific fields?

The fields needed by an application can be indicated by setting the `profileFields` option.

```js
new MiroStrategy({
  clientID: MIRO_APP_ID,
  clientSecret: MIRO_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/miro/callback",
  profileFields: ['id', 'role', 'picture', 'email']
}), ...)
```

Refer to the [User](https://developers.miro.com/reference#get-current-user)
section of the REST API Reference for the complete set of available fields.

## License

[The MIT License](http://opensource.org/licenses/MIT)
