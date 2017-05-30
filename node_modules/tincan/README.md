tincan-nodejs
=============

A thin wrapper for reading and writing data using the tincan.me API using Node.JS

Installation
------------

To install from NPM, use `npm install tincan`

Setup
-----

To use this package, you'll need a TinCan developer account (currently invite-only). Once you've got one, supply your credentials like so:

    var tincan = require("tincan");
    var myApp = new tincan("example", "5e6a7e38c97b", "81aca0b3a200dd52bda8bca268ee68a8");

In this case, the application is named `"example"`, the app ID is `5e6a7e38c97b`, and its key is `81aca0b3a200dd52bda8bca268ee68a8`.

Once you've done that, a request will be made asynchronously to validate your credentials with the server. If anything goes wrong, an error will be thrown. The constructor also takes an optional fourth callback parameter that gives a single  `error` argument, called once the API is ready. In the event of an error, the callback will be called immediately before the error is thrown, and will contain the error message. However, assuming there are no problems, you can use the API immediately, even before the callback fires.

Usage
-----

For a more in-depth description of these functions, check the official documentation at http://apps.tincan.me/

Their syntax is as follows:

- `tincan.find([query], callback)`
- `tincan.insert(query, [callback])`
- `tincan.remove(query, [callback])`
- `tincan.update(search, query, [callback])`
- `tincan.user(query, callback)`

All queries can be either objects or JSON-encoded strings (which will be passed along as-is). Callbacks follow the standard format of `(err, data)`.

Example
-------

    // Initialize the API
    var tincan = require("tincan");
    var myApp = new tincan("example", "5e6a7e38c97b", "81aca0b3a200dd52bda8bca268ee68a8");
    
    // Look up a user
    myApp.user({token: "29e39a4c-3c43-493f-ba35-d3a747b3d83d"}, function(err, user{
    	if(!err && user){
    		// Insert some data
    		myApp.insert({name: user.name, image: user.avatar, age: 37, online: true});
    	}else
    		console.log("User is not logged in");
    }));
    
    // Fetch all online users
    // NOTE: The above call was asynchronous, so it probably won't have completed yet.
    myApp.find({online: true}, function(err, users){
    	if(!err && users){
    		for(var i in users)
    			console.log(users[i].name);
    	}else
    		throw new Error(err);
    });
    
    // Change some data
    myApp.update({name: "John Mitchell"}, {$set: {online: false}});
    
    // Remove a document
    myApp.remove({name: "John Mitchell"});
