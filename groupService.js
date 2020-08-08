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
app.get('/groups/search/:search', function (req, res) {
    let search_term = req.params.search;
    let search_results = [];
    try {
        let query = "CALL search_for_groups(\"" + search_term + "\");";
        connection.query(query, function (err, result) {
            if (err) { throw err }
            else {
                if (result[0].length > 0) {
                    result[0].forEach(group => {
                        let found_group = new Group(group.id, group.group_name, group.description, group.goal);
                        search_results.push(found_group);
                    });
                }

                res.send({ found_groups: search_results });
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
app.post('/groups', function (req, res) {
    let group = req.body.group;
    let milestones = req.body.milestones;
    try {
        let query = "CALL add_new_group(\"" + group.name + "\", \"" + group.description + "\", \"" + group.goal + "\", " + group.admin + ")";
        connection.query(query, function (err, result) {
            if (err) { throw err }
            else {
                let new_group_id = result[0][0].inserted_id;
                if (milestones.length != 0) {
                    milestones.forEach(ms => {
                        let query = "CALL Add_group_milestone(" + new_group_id + ", \"" + ms.name + "\", " + ms.order + ")";
                        connection.query(query, function (err, result) {
                            if (err) { throw err }
                        })
                    });
                }
                res.send({ status: 200, message: group.name + " has been created!" });
            }
        })
        console.log("New Group Alert! - " + group.name);
    }
    catch (err) {
        res.send({ status: 500, message: 'Internal Server Error' });
    }
})

/**Get group Information
 *
 * params: group_id
 * return: group_id, group_name, group_description, group_goal, admin_name
 */
app.get('/groups/:id', function (req, res) {
    let group = req.params.id;
    try {
        let query = "CALL Get_group_information(" + group + ");";
        connection.query(query, function (err, result) {
            if (err) { throw err }
            else {
                let group_data = new Group(result[0][0].id, result[0][0].group_name, result[0][0].description, result[0][0].goal, result[0][0].admin_id)
                res.send({ group: group_data });
            }
        })
    } catch (err) {

    }
})

/** Get group milestones
 * params: group_id
 * return; list of milestones for the group (milestone_id, name, order)
 */

/**Add a member to a group
 * params: user_id, group_id
 * return true if complete
*/
app.post('/groups/members', function (req, res) {
    let user = req.body.user;
    let group = req.body.group;
    try {
        let query = "CALL Add_user_to_group(" + user + ", " + group + ");";
        connection.query(query, function (err, result) {
            if (err) { throw err }
            else {
                console.log("user: " + user + " has joined group: " + group);
                res.send({ status: 200, message: "Welcome to the Group!" });
            }
        })
    } catch (err) {

    }
})

/**Add post to group
 * params: groupId, memberId, post, timestamp
*/
app.post('/groups/:id/posts', function(req, res){
    let group = req.params.id;
    let user = req.body.user;
    let post = req.body.post;
    try {
        let query = "CALL Add_new_post("+group+", "+user+", \""+post+"\");";
        connection.query(query, function(err, result){
            if(err){throw err}
            else{
                console.log("New post in Group - "+ group);
                res.send({status: 200, message: "Post added to group!"})
            }
        })
    } catch (err) {
        
    }
})

/**Get 10 most recent posts associated with group
 *
 * params: group_id
 * return list of posts (no comments) to display on the group page ( post_id, member_id, member_name, post, timestamp)
 */
app.get('/groups/:id/posts', function(req, res){
    let group = req.params.id;
    let posts = [];
    try {
        let query = "CALL Get_top10_posts("+group+");";
        connection.query(query, function(err, result){
            if(err){throw err}
            else{
                result[0].forEach(post => {
                    let found_post = new Post(post.id, post.group_id, post.group_name, post.full_name, post.username, post.post, post.born_date);
                    posts.push(found_post);
                });
            }

            res.send({status: 200, posts:posts});
        })
    } catch (err) {
        
    }
})

 /**Get next 10 most recent posts associated with group
 *
 * params: group_id, last_post_id
 * return list of posts (no comments) to display on the group page ( post_id, member_id, member_name, post, timestamp)
 */
app.get('/groups/:id/posts/:lastPost', function(req, res){
    let group = req.params.id;
    let last_post_id = req.params.lastPost;
    let posts = [];
    try {
        let query = "CALL Get_next10_posts("+group+", "+last_post_id+");";
        connection.query(query, function(err, result){
            if(err){throw err}
            else{
                result[0].forEach(post => {
                    let found_post = new Post(post.id, post.group_id, post.group_name, post.full_name, post.username, post.post, post.born_date);
                    posts.push(found_post);
                });
            }

            res.send({status: 200, posts:posts});
        })
    } catch (err) {
        
    }
})

/**add comment to post in group
 *
 * params: post_id, member_id, comment
 */
app.post('/posts/:id/comments', function(req, res){

    let post = req.params.id;
    let user = req.body.user;
    let comment = req.body.comment;
    try {
        let query = "CALL Add_comment_to_post("+post+", "+user+", \""+comment+"\");";
        connection.query(query, function(err, result){
            if(err){throw err}
            else{
                res.send({status:200, message:"Comment added to post"});
            }
        })
    } catch (err) {
        
    }

})

/**Add comment to comment to post in a group
 *
 * params: comment_id, member_id, comment, timestamp
 */

/**Get comments associated with post
 *
 * params: post_id
 * return: list of comments (member_id, comment, timestamp)
 */
app.get('/posts/:id/comments', function(req, res){
    let post = req.params.id;
    let comments = [];
    try {
        let query = "CALL Get_post_comments("+post+");";
        connection.query(query, function(err, result){
            if(err){throw err}
            else{
                result[0].forEach(comment => {
                    let found_comment = new Comment(comment.id, comment.post_id, comment.full_name, comment.username, comment.comment, comment.date);
                    comments.push(found_comment);
                })
                res.send({status:200, comments:comments});
            }
        })
    } catch (err) {
        
    }
})

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

/**holds post information
 * 
 */
class Post {

    constructor(id, group_id, group_name, user_name, username, post, date){
        this.id = id;
        this.groupId = group_id;
        this.groupName = group_name;
        this.user = user_name;
        this.username = username;
        this.post = post
        this.creationDate = date;
    }
}

/**holds comment information 
 * 
*/
class Comment{
    constructor(id, post_id, user, username, comment, date){
        this.id = id;
        this.postId = post_id;
        this.user = user;
        this.username = username;
        this.comment = comment;
        this.creationDate = date;
    }
}