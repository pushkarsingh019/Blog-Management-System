const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3030;

mongoose.connect("mongodb://localhost/blog");

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended : false}));

// Global Variabbles
let postTitleCounter = 0;

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






// Get routes

app.get('/', function(req,res){

    Post.find({}, function(err, foundPosts){
        if(err){
            console.log(err)
        }
        else{
            res.render('Home', {foundPosts : foundPosts});
        }
    })
})

app.get('/newpost', function(req, res){
    res.render('newpost');
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
                res.render('post', {sendTitle : sendTitle , sendPost : sendPost});
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


    res.render('home');
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
