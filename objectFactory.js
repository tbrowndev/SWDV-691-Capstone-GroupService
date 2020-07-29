export class User {

    id;
    name;
    email;
    phone;
    username;

    constructor(id, name, email, phone, username) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.username = username;
    };

    getId() {
        return this.id;
    }
}

export class Group {
    id;
    adminId;
    name;
    description;
    goal;

    constructor(id, adminId, name, description, goal) {
        this.id = id;
        this.adminId = adminId;
        this.name = name;
        this.description = description;
        this.goal = goal;
    };

    getId() {
        return this.id;
    }

    getadminId() {
        return this.adminId;
    }

    setName(newName) {
        this.name = newName;
    }

    setDescription(newDesc) {
        this.description = newDesc;
    }

    setGoal(newGoal) {
        this.goal = newGoal;
    }

}

export class Post {
    id;
    groupId;
    memberId;

    memberName;
    groupName;
    postData;
    timestamp;

    constructor(id, groupId, memberId, memberName, groupName, postData, timestamp) {
        this.id = id;
        this.groupId = groupId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.groupName = groupName;
        this.postData = postData;
        this.timestamp = timestamp;
    };

    getId() {
        return this.id;
    }
    getGroupId() {
        return this.groupId;
    }
    getMemberId() {
        return this.memberId;
    }
}

export class Comment {
    id;
    postId;
    memberId;
    memberName;
    commentData;
    timestamp;

    constructor(id, postId, memberId, memberName, commentData, timestamp) {
        this.id = id;
        this.postId = postId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.commentData = commentData;
        this.timestamp = timestamp;
    }

    getId() {
        return this.id;
    }

    getPostId() {
        return this.postId;
    }

    getmemberId() {
        return this.memberId;
    }
}

export class Subcomment {
    id;
    commentId;
    memberId;
    memberName;
    commentData;
    timestamp;

    constructor(id, commentId, memberId, membername, commentData, timestamp) {

        this.id = id;
        this.commentId = commentId;
        this.memberId = memberId;
        this.memberName = membername;
        this.commentData = commentData;
        this.timestamp = timestamp;
    }

    getId() {
        return this.id;
    }

    getCommentId() {
        return this.commentId;
    }

    getMemberId() {
        return this.memberId;
    }
}