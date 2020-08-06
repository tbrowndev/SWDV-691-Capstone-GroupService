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
const db_config = require('../db_config.json');;

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
app.get('/groups/search', function(req,res) {
    let search_term = req.body.search_term;
    search_results = [];
    try {
        let query = "CALL search_for_groups(\""+search_term+"\");";
        connection.query(query, function(err, results){
            if(err){throw err}
            else{
                results.forEach(group => {
                    found_group = new Group(group.id, group.name, group.description, group.goal);
                    search_results.push(found_group);
                });
                res.sendStatus(200).send(search_results);
            }
        })
    } catch (err) {
        
    }
})

/** Add a group to the database
 *
 * params: group_name, group_desc, group_goal, admin_id
 * [get the id of newly created group]
 * for each milestone, add to the database for the group w/order
 *
 */
app.post('/groups', function(req,res){
    let group = req.body.group;
    let milestones = req.body.milestones;
    try{
        let query = "CALL add_new_group(\""+group.name+"\", \""+group.description+"\", \""+group.goal+"\", "+group.admin+")";
        connection.query(query, function (err, result){
            if(err){throw err}
            else{
                let new_group_id = result[0][0].inserted_id;
                if(milestones.length != 0){
                    milestones.forEach(ms =>{
                        let query = "CALL Add_group_milestone("+new_group_id+", \""+ms.name+"\", "+ms.order+")";
                        connection.query(query, function(err, result){
                            if(err){throw err}
                        })
                    });
                }
                res.send({status: 200, message: group.name + " has been created!"});
            }
        })
        console.log("New Group Alert! - " + group.name);
    }
    catch (err){
        res.send({status: 500, message:'Internal Server Error'});
    }
})

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

 /**
 * OBJECTS TO PASS DATA TO AND FROM APPLICATION. 
 */

/**
 * holds group information 
 */
class Group {
    
    constructor(id, name, description, goal, admin) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.goal = goal;
        this.admin = admin;
    }

}