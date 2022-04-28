const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
let PORT = process.env.PORT;
if(PORT == null || PORT == ""){
    PORT = 3000;
}

mongoose.connect(process.env.MONGODB_URL); // Add mongodb url instead of this environment variable

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(__dirname));


// Global Variabbles
let postTitleCounter = 0;
let editTitle = "";

// MongoDb Schemas

const subscriberSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    }
})

const postSchema = new mongoose.Schema({
    title : String,
    post : {
        type : String,
        required : true
    },
    tags : []
})

// Mongodb models
const Subscriber = mongoose.model("subsriber", subscriberSchema);

const Post = mongoose.model("post", postSchema);


// Authentication Function
const userName = process.env.USERNAME;
const password = process.env.PASSWORD;
let authFlag = 0;


// Get routes

app.get('/', function(req,res){

    Post.find({}, function(err, foundPosts){
        if(err){
            console.log(err)
        }
        else{
            res.render('home', {foundPosts : foundPosts});
        }
    })
})

app.get('/about', (req, res)=>{
    res.render('about');
})
app.get('/contact', (req, res)=>{
    res.render('contact');
})

app.get('/newpost', function(req, res){
    if(authFlag == 1){
        res.render('newpost');
    }
    else{
        res.render('login');
    }
})

// app.get('/admin', function(req, res){

//     Subscriber.find({}, (err, list) => {
//         if(err){
//             console.log(err)
//         }
//         else{
//             res.render('admin', {list : list});
//         }
//     })
// })

app.get('/admin', function(req, res){
    if(authFlag === 1){
        res.render('admin');
    }
    else{
        res.render('login')
    }
})

app.get('/admin/:adminUrl', function(req, res){
    let adminChoice = req.params.adminUrl;

    if(adminChoice == "subscribers"){
        Subscriber.find({}, function(err, list){
            if(err){
                console.log(err)
            }
            else{
                res.render('subscribers', {list : list })
            }
        })
    }

    else if(adminChoice == "updatePost"){
        Post.find({}, function(err, posts){
            if(err){
                console.log(err)
            }
            else{
                res.render('deletePost', {posts : posts});
            }
        })
    }
})




app.listen(PORT, () => {
    console.log("PORT connected")
})


// Post Request Params
app.get('/posts/:premalink', function(req, res){

    // res.send("working")
    let typedTitle = req.params.premalink;

    // console.log(typedTitle);

    let sendTitle = "";
    let sendPost = "";


    Post.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }
        else{
            for(let index=0; index < blogs.length ; index++){
                if(typedTitle == blogs[index].title){
                    postTitleCounter = 1;
                    sendTitle = blogs[index].title;
                    sendPost = blogs[index].post;
                    break;
                }
                else{
                    postTitleCounter = 0;
                }
            }

            if(postTitleCounter === 1){
                res.render('post', {sendTitle : sendTitle , sendPost : sendPost, authFlag : authFlag});
            }
            else{
                res.render('404');
            }
        }
    })



    // Post.find({}, (err, blogs) => {
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         blogs.forEach(function(posts){
    //             console.log(posts.title);
    //             if(typedTitle === posts.title){
    //                 postTitleCounter = 1;
    //                 sendTitle = posts.title;
    //                 sendPost = posts.post;
    //                 console.log("Typed Title --> " + typedTitle + " Stored Title --> " + posts.title);
    //             }
    //             else{
    //                 console.log("Typed Title --> " + typedTitle + " Stored Title --> " + posts.title);
    //                 postTitleCounter = 0;
    //             }
    //         })

    //         if(postTitleCounter === 1){
    //             res.render('post' , {sendTitle : sendTitle , sendPost : sendPost});
    //         }
    //         else{
    //             res.render('404');
    //         }
    //     }
    // })

})


// POST Routes
app.post("/subscribe", function(req,res){
    const obj = JSON.parse(JSON.stringify(req.body));

    // Adding the email to database
    const emailId = new Subscriber({
        email : obj.subscriberEmail
    })
    emailId.save();


    res.redirect('/');
})

app.post('/newpost', function(req, res){
    const obj1 = JSON.parse(JSON.stringify(req.body));


    const newPost = new Post({
        title : obj1.postLabel,
        post : obj1.postText,
        tags : obj1.postTags
    })
    console.log("Post Title -> " +obj1.postLabel)

    newPost.save();
    res.redirect('/');
})

app.post('/login', function(req, res){
    if(req.body.username == "pushkarsingh019" && req.body.password == "72087"){
        authFlag = 1;
        res.redirect('admin');
    }
    else{
        authFlag = 0;
        res.send("Authentication Failed");
    }
})

app.post('/do-delete', (req, res)=>{
    let obj2 = JSON.parse(JSON.stringify(req.body));
    let deleteTitle = obj2.deletePostTitle;

    Post.deleteOne({ title : deleteTitle}).then(function(){
        res.redirect('/');
    }).catch(function(){
        console.log(err);
    });
})

app.post('/editPost', function(req, res){
    let obj3 = JSON.parse(JSON.stringify(req.body));

    editTitle = req.body.editPostTitle;

    console.log(editTitle);

    Post.findOne({title : editTitle}, function(err, blogs){
        if(err){
            console.log(err)
        }
        else{
            res.render('updatePost', {blogs : blogs});
        }
    })
})

app.post('/updateBlog', function(req, res){
    let obj4 = JSON.parse(JSON.stringify(req.body));

    let updatedTitle = obj4.updatedBlogTitle;
    let updatedPost = obj4.updatedBlogText;
    let updatedTags = obj4.updatedBlogTags;

    Post.updateOne({title : editTitle}, {title : updatedTitle, post : updatedPost, tags : updatedTags}).then(function(){
        res.redirect('/')
    }).catch(function(){
        console.log(err)
    })
})


