const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const homeStartingContent = "Hey there! This is my blog. Feel free to browse through the list of posts or create one if you wish"


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb+srv://Sushmit:test123@cluster0-1t6bf.mongodb.net/siteDB',{useNewUrlParser:true,useUnifiedTopology: true});

const postSchema = {
    title: String,
    content: String
};

const Post = mongoose.model("Post",postSchema);

const itemsSchema = {
    name:String
}

const Item = mongoose.model("Item",itemsSchema);

app.get('/',function(req,res){
    res.render("home");
});

app.get('/blog/compose',function(req,res){
    res.render('compose');
})

app.get("/blog",function(req,res){
    Post.find({},function(err,foundItems){
        res.render('blogHome',{homeStartingContent:homeStartingContent,posts:foundItems});
    })
})

app.get('/blog/posts/:postId',function(req,res){
    const requestedPostId = req.params.postId;
    Post.findOne({_id:requestedPostId},function(err,post){
        if(!err){
            res.render("post",{title:post.title,bodyContent:post.content,titleId:post._id});
        }
        else{
            console.log(err);
        }
    })
});

app.get('/blog/contact',function(req,res){
    res.render('contact');
})

app.get('/blog/about',function(req,res){
    res.render('about');
})

app.get('/weather',function(req,res){
    res.render("weather");
})

app.get('/todo',function(req,res){
    Item.find({},function(err,foundItems){
        res.render("list",{listTitle:"Today",newListItems:foundItems});
    });
});

app.post('/weatherFind',function(req,res){
    const query = req.body.cityName;
    const apiKey = "482225bad9aabae994785a0fa4becb61";
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apiKey+"&units="+unit;
    https.get(url,function(response){
        console.log(response.statusCode);
        response.on("data",function(data){
            const weatherData = JSON.parse(data);
            const temp = weatherData.main.temp;
            const weather_desc = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            const imageUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

            res.write("<p>The weather in "+query+" is currently "+ weather_desc + "<p>");
            res.write("<h1>The temperature in "+query + " is currently " + temp + " degree celsius <h1>");
            res.write("<img src="+imageUrl+">");
            
            res.send();
        })
    })

})

app.post('/todo',function(req,res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    })

    item.save();
    res.redirect('/todo');
});

app.post('/todo/delete',function(req,res){
    const checkedItem = req.body.checkbox;
    Item.findByIdAndRemove(checkedItem,function(err){
        if(!err){
            console.log("Successfully deleted checked item");
            res.redirect('/todo');
        }
    });
});

// app.get('/blog',function(req,res){
//     Post.find({},function(err,foundItems){
//         res.render('blogHome',{homeStartingContent:homeStartingContent,posts:foundItems});
//     })
// });

app.post('/blog/compose',function(req,res){
    const titleDB = req.body.postTitle;
    const contentDB = req.body.postBody;

    const post = new Post({
        title: titleDB,
        content: contentDB
    });

    post.save(function(err){
        if(!err){
            res.redirect("/blog");
        }
    });
});

app.post('/blog/delete',function(req,res){
    deleteId = req.body.deleteTitle;
    Post.findByIdAndRemove(deleteId,function(err){
        if(!err){
            console.log("Item deleted successfully");
        }
        res.redirect('/blog');
    })
})

app.listen(process.env.PORT || 3000,function(){
    console.log('Server running on port 3000');
});