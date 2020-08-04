// Set up
'use strict'
var argon2 = require('argon2');
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');


// Configuration
var connection;
const db_config = process.env.CLEARDB_DATABASE_URL;

app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, POST, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function handleDisconnect() {
    connection = mysql.createConnection(db_config);

    connection.connect(function (err) {
        if (err) {
            console.log("Group Service has error connection to db: " + err);
            setTimeout(handleDisconnect, 2000);
        }
        console.log("Group Service is connected to db")
    });

    connection.on("error", function (err) {
        console.log("Group Service db error", err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log("Group Service is reattempting database connection....")
            handleDisconnect();
        }
        else {
            console.log(err);
            console.log(" Group Service no longer has a connection to db")
        }
    });
}

handleDisconnect(); // starts database connection. 

// Start app and database connection and listen on port 6210  
app.listen(process.env.GROUP_PORT || 6210);
console.log("Auth Service listening on port  - ", (process.env.GROUP_PORT || 6210));


/** search database for groups that have the search term in the name, description, or goal
 *
 * params: search_term
 * return: list of group (group_id, group_name, group_description, group_goal)
 */

/** Add a group to the database
 *
 * params: group_name, group_desc, group_goal, admin_id
 * [get the id of newly created group]
 * for each milestone, add to the database for the group w/order
 *
 */

/**Get group Information
 *
 * params: group_id
 * return: group_id, group_name, group_description, group_goal, admin_name
 */

/** Get group milestones
 * params: group_id
 * return; list of milestones for the group (milestone_id, name, order)
 */

/**Add a member to a group
 * params: user_id, group_id
 * return true if complete
*/

/**Add post to group
 * params: groupId, memberId, post, timestamp
*/

/**Get all posts associated with group
 *
 * params: group_id
 * return list of posts (no comments) to display on the group page ( post_id, member_id, member_name, post, timestamp)
 */

/**add comment to post in group
 *
 * params: post_id, member_id, comment, timestamp
 */

/**Add comment to comment to post in a group
 *
 * params: comment_id, member_id, comment, timestamp
 */

/**Get comments associated with post
 *
 * params: post_id
 * return: list of comments (member_id, comment, timestamp)
 */

/**Get comments to comments in post
 *
 * params: comment_id
 * return: list of comments associate with commet (member_id, comment, timestamp)
 */