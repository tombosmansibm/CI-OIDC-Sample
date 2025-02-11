var request = require('request');
var express = require('express');
var router = express.Router();
var OIDC_BASE_URI = process.env.OIDC_CI_BASE_URI;

var session = require('express-session');

// GET homepage
router.get('/', function(req, res, next) {
  // can i now read from the
  if (Object.hasOwn(req.session, 'passport')) {
    // means we're logged in
    // Log the user profile
    res.render('users', {
      title: 'Users',
      user: req.session.passport.user,
      loggedin: (req.query.loggedin == 'success') ? true : false
    });
  }
  else{
    // If no session exists, show the index.hbs page
    res.render('index', {
    title: 'IBM Cloud Identity OpenID Connect Example',
    loggedout: (req.query.loggedout == 'success') ? true : false 
  });
  }
});

// GET profile
router.get('/profile', (req, res, next) => {
  var at = "";
  if (Object.hasOwn(req.session, 'passport')) {
    // means we're logged in
    at = req.session.passport.user.accessToken;
    console.log("PROFILE ACCESS TOKEN: "+at);
  }
  var __request = {
        url: `${OIDC_BASE_URI}/userinfo`,
        headers: {
            'Authorization': 'Bearer '+at
        }
        };
  console.log(__request);
  request.get(__request, function(err, response, body){

    //console.log(response.headers)
    console.log('User Info')
    console.log(body);

    pbody = JSON.parse(body);
    vbody = JSON.stringify(pbody, null, 2);

    res.render('profile', {
      title: 'Profile',
      user: pbody,
      fullJson: vbody
    });
  });
});

router.get('/introspect', function(req, res, next) {
  var at = "";
  if (Object.hasOwn(req.session, 'passport')) {
    // means we're logged in
    at = req.session.passport.user.accessToken;
    console.log("INTROSPECT ACCESS TOKEN: "+at);
  }
  request.post(`${OIDC_BASE_URI}/introspect`, {
    'form': {
      'client_id': process.env.OIDC_CLIENT_ID,
      'client_secret': process.env.OIDC_CLIENT_SECRET,
      'token': at,
      'token_type_hint': 'access_token'
      }
    }, function(err, response, body){

    console.log('Introspect output')
    console.log(body);

    pbody = JSON.parse(body);
    vbody = JSON.stringify(pbody, null, 2);

    res.render('introspect', {
      title: 'Introspect',
      atoken: req.session.accessToken,
      introspect: pbody,
      fullJson: vbody
    });
  });
});

module.exports = router;
