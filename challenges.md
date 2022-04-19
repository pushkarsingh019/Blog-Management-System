# Jump Statements are not there in for Each
### Whats the problem causing?
- We are using the express routing parameters ("/posts/:typedTitle")
- then we see that if the typed Title matches with one of the title present in the database or not.
- then, when the title's match, it sends the data to the post.ejs and the data is presented.
- and if the data is matched then, then the app renders the app.
- but the stored title is always the last element in the array, we need a system to break out of the loop, when the types title becomes the stored title.

### How Did I solved it?
- Could not find a way to break out in for each, so changed the code for for in.