var https = require("https"),
    ca = null;

var Tincan = function(appName, appID, appKey, cb){

	// Make sure all our inputs are correct
	if(!appName || !appID || !appKey){
		if(cb)
			cb.call(this, "Application name, ID, and key are all required.");
		throw new Error("Application name, ID, and key are all required.");
	}else if(typeof appName != "string" || typeof appID != "string" || typeof appKey != "string"){
		if(cb)
			cb.call(this, "Application name, ID, and key must all be strings.");
		throw new Error("Application name, ID, and key must all be strings.");
	}else{
		this.appName = appName.toLowerCase();
		this.appID = appID;
		this.appKey = appKey;
	}

	if(!ca){
		var path = require('path'),
		    fs = require('fs');
		ca = [fs.readFileSync(path.join(__dirname, "ca.pem")),
			fs.readFileSync(path.join(__dirname, "sub.class1.server.ca.pem"))];
	}

	this.makeRequest = function(type, data, callback){
		// Don't try sending a request unless we have credentials
		if(!this.appName || !this.appID || !this.appKey){
			if(callback)
				callback.call(this, "NO_CREDENTIALS", null);
			return;
		}

		var options = {
			hostname: 'apps.tincan.me',
			port: 443	,
			path: '/' + appName + '/' + type,
			auth: this.appID + ':' + this.appKey,
			method: 'POST',
			ca: ca // Node 0.10.x will throw UNABLE_TO_VERIFY_LEAF_SIGNATURE without this
			// See https://github.com/kenperkins/winston-papertrail/issues/6
		};

		var req = https.request(options, function(res){
			if(callback){
				var data = "";
				res.setEncoding('utf8');

				res.on('data', function(chunk){
					data += chunk;
				});

				res.on('end', function(){
					try{
						var obj = JSON.parse(data);
						callback.call(this, null, obj);
					}catch(e){
						console.log(data);
						callback.call(this, "SERVER_ERROR", null);
					}
				});
			}
		});

		req.on('error', function(err){
			callback.call(this, err, null);
		});

		if(data)
			req.write(data);
		req.end();
	}

	// Check the given credentials. If they fail, throw an error and uninitialize
	this.makeRequest("authorized", null, function(err, res){
		if(!err && res){
			if(res.success !== true){
				this.appName = null;
				this.appID = null;
				this.appKey = null;

				if(res.error){
					if(cb)
						cb.call(this, res.error);
					throw new Error(res.error);
				}else{
					if(cb)
						cb.call(this, "SERVER_ERROR");
					throw new Error("SERVER_ERROR");
				}
			}else if(cb)
				cb.call(this, null);
		}else{
			if(cb)
				cb.call(this, err);
			throw new Error(err);
		}
	});

	this.find = function(query, callback){
		if(query){
			if(typeof query == "function"){
				callback = query;
				query = null;
			}else if(typeof query != "string")
				query = JSON.stringify(query);
		}else{
			callback.call(this, "NO_DATA", null);
			return;
		}

		this.makeRequest("find", query, function(err, res){
			if(!err && res){
				callback.call(this, res.error, res.data);
			}else
				callback.call(this, err, null);
		});
	}

	this.insert = function(query, callback){
		if(query){
			if(typeof query != "string")
				query = JSON.stringify(query);
		}else{
			if(callback)
				callback.call(this, "NO_DATA", null);
			return;
		}

		this.makeRequest("insert", query, function(err, res){
			if(!err && res){
				if(callback)
					callback.call(this, res.error);
			}else if(callback)
				callback.call(this, err, null);
		});
	}

	this.remove = function(query, callback){
		if(query){
			if(typeof query != "string")
				query = JSON.stringify(query);
		}else{
			if(callback)
				callback.call(this, "NO_DATA", null);
			return;
		}

		this.makeRequest("remove", query, function(err, res){
			if(!err && res){
				if(callback)
					callback.call(this, res.error);
			}else if(callback)
				callback.call(this, err, null);
		});
	}

	this.update = function(search, query, callback){
		if(search){
			if(typeof search != "string")
				search = JSON.stringify(search);
		}else{
			if(callback)
				callback.call(this, "NO_DATA", null);
			return;
		}if(query){
			if(typeof query != "string")
				query = JSON.stringify(query);
		}else{
			if(callback)
				callback.call(this, "NO_DATA", null);
			return;
		}

		// Assembling this JSON by hand should be safe, since it's already been encoded
		var queryString = "[" + search + "," + query + "]";
		this.makeRequest("update", queryString, function(err, res){
			if(!err && res){
				if(callback)
					callback.call(this, res.error);
			}else if(callback)
				callback.call(this, err, null);
		});
	}

	this.user = function(query, callback){
		if(query){
			if(typeof query != "string"){
				if(!query.id && !query.token){
					callback.call(this, "BAD_DATA", null);
					return;
				}

				query = JSON.stringify(query);
			}
		}else{
			callback.call(this, "NO_DATA", null);
			return;
		}

		this.makeRequest("user", query, function(err, res){
			if(!err && res)
				callback.call(this, res.error, res.data);
			else
				callback.call(this, err, null);
		});
	}
}

module.exports = Tincan;
