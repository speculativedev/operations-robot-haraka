/*exports.register = function() {
    this.register_hook('rcpt',    'send_to_redis');  
};*/

exports.hook_data = function (next, connection) {
    this.loginfo("connection.transaction.parse_body");
    connection.transaction.parse_body = true;
    next();
}

exports.hook_data_post = function (next, connection) {

    //this.loginfo("connection.transaction.body.bodytext");
    //this.loginfo(connection.transaction.body.children[0].bodytext);
    //this.loginfo(connection.transaction.body.children[1].bodytext);
    //this.loginfo("from:"+connection.transaction.body.header.get("from"));
    //this.loginfo("subject:"+connection.transaction.body.header.get("subject"));

    // need to parse children [0] here for only passing the right stuff through.
    var body = connection.transaction.body.children[0].bodytext;
    var domain = connection.transaction.body.header.get("from").replace(/.*@/, "");
    domain = domain.replace(">","");
    domain = domain.trim();
    
    this.loginfo("from_domain:"+domain);

    if(domain != "digitalocean.com" && domain != "netnomes.com") {
 //       this.loginfo("digitalocean.com != "+domain+" != netnomes.com");
        next();
        return;
    }

    var redis = require("redis");
    var publisher = redis.createClient();
    publisher.publish("operations-robot-msgs", "from:"+connection.transaction.body.header.get("from")+" "+"subject:"+connection.transaction.body.header.get("subject")+" "+body+"\n\n.");
//    this.loginfo("from:"+connection.transaction.body.header.get("from")+" "+"subject:"+connection.transaction.body.header.get("subject")+" "+body+"\n\n.");

    next();
}

exports.hook_queue = function (next, connection) {
    return next(OK, 'Message accepted with id '+connection.transaction.uuid);
}

exports.hook_rcpt = function (next, connection, params) {
    return next(OK, 'Message accepted with id '+connection.transaction.uuid);
}


/*
exports.send_to_redis = function (next, connection, params) {
    var hook_name = connection.hook; // rcpt or rcpt_ok
    // email address is in params[0]

    this.loginfo("connection.transaction.body.bodytext");
    //this.loginfo(connection.transaction.body.children[1].bodytext);

    // Redis Init
	var redis = require("redis");
	var publisher = redis.createClient();
    publisher.publish("operations-robot-msgs", params[0].toString());	
    publisher.publish("operations-robot-msgs", JSON.stringify(connection.transaction.body));
    //publisher.publish("operations-robot-msgs", connection.transaction.body.header.get("Subject"));
    //publisher.publish("operations-robot-msgs", connection.transaction.body.bodytext);
	// End Redis Init

    next(OK); // we are done here
}*/
