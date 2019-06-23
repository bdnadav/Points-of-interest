const express = require("express");
const app = express();
app.use(express.urlencoded());
var DButilsAzure = require('./DButils');
var user_module = require('./UserSystem_module');
var poi_module = require('./PointsOfInterest_module');
var port = 3000;
const jwt = require("jsonwebtoken");
var bodyParser = require('body-parser');


app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

app.use("/user", (req, res, next) => {
    var secret = "secret";
    const token = req.query["x-auth-token"];
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST,PUT,DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        next(); //move on to the actual function
    } catch (exception) {
        res.status(400). send("Invalid token.");
    }
});


app.post("/login", async function (req, res) {
    console.log(req);
    let Username = req.query.Username;
    let Password = req.query.Password;
    var token = await user_module.login(Username, Password);
    if (token instanceof Error) {
        console.log(token);
        res.status(400).send(token.message);
    } else {
        console.log(token);
        res.status(200).send(token);
    }
});

app.post("/register", async function (req, res) {
    let Username = req.query.Username;
    let Password = req.query.Password;
    let Firstname = req.query.Firstname;
    let Lastname = req.query.Lastname;
    let City = req.query.City;
    let Country = req.query.Country;
    let Email = req.query.Email;
    let Interests = req.query.Interests;
    let QA = req.query.QA;
    var result = await user_module.register(Username, Password, Firstname, Lastname, City, Country, Email, Interests, QA);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(Username + " been added.");
    }
});

app.post("/user/updateUser", async function (req, res) {
    let Username = req.decoded.Username;
    let Password = req.query.Password;
    let Firstname = req.query.Firstname;
    let Lastname = req.query.Lastname;
    let City = req.query.City;
    let Country = req.query.CountryID;
    let Email = req.query.Email;
    let Interests = req.query.Interests;
    let QA = req.query.QA;
    var result = await user_module.updateUser(Username, Password, Firstname, Lastname, City, Country, Email, Interests, QA);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(Username + " been added.");
    }
});

app.post("/passwordRetrieval", async function (req, res) {
    let Username = req.query.Username;
    let QA = req.query.QA;
    var result = await user_module.passwordRetrival(Username, QA);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.post("/user/getFullUserDetails", async function (req, res) {
    let username = req.decoded.username;
    let user_details = req.query.username_details;
    if (username !== "admin")
        res.status(401).send("You are not authorized to make that action");
    var result = await user_module.getFullUserDetails(user_details);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.post("/user/getUserDetails", async function (req, res) {
    let user_details = req.query.username_details;
    var result = await user_module.getUserDetails(user_details);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});


app.get("/getPopularRandomPoints", async function (req, res) {
    let amountOfPoints = req.query.pointsAmount;
    let minRate = req.query.minRate;
    var result = await poi_module.getPopularRandomPoints(amountOfPoints, minRate);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.put("/user/writePointReview", async function (req, res) {
    let point_id = req.query.point_id;
    let stars = req.query.stars;
    let review_txt = req.query.review_txt;
    let username = req.decoded.username;
    var result = await poi_module.writePointReview(username, point_id, stars, review_txt);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});


app.get("/getClickedPointDetails", async function (req, res) {
    let point_id = req.query.point_id;
    var result = await poi_module.getClickedPointDetails(point_id);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getMostPopularPointsByCategory", async function (req, res) {
    let categories_name = req.query.categories_name;
    var result = await poi_module.getMostPopularPoints(categories_name);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getPointByName", async function (req, res) {
    let point_name = req.query.point_name;
    var result = await poi_module.getPointByName(point_name);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getAllPoints", async function (req, res) {
    var result = await poi_module.getAllPoints();
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getPointsByCategory", async function (req, res) {
    console.log("req.query.category: " + req.query.category);
    // let jsonCategory = JSON.parse(req.query.category);
    // console.log(jsonCategory);
    // var result = await poi_module.getPointsByCategory(jsonCategory.category);
    let category = req.query.category;
    var result = await poi_module.getPointsByCategory(category);
    if (result instanceof Error) {
        console.log("result: " + result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getAllCategories", async function (req, res) {
    var result = await poi_module.getAllCategories();
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});


app.get("/user/getUserSavedPoints", async function (req, res) {
    let username = req.decoded.username;
    var result = await poi_module.getUserSavedPoints(username);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.put("/user/saveUserPoints", async function (req, res) {
    let username = req.decoded.username;
    let userPoints = req.query.user_points;
    var result = await poi_module.saveUserPoints(username, userPoints);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getInterestPointReviews", async function (req, res) {
    let point_id = req.query.point_id;
    var result = await poi_module.getInterestPointReviews(point_id);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getPointByID", async function (req, res) {
    let point_id = req.query.point_id;
    var result = await poi_module.getPointByID(point_id);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.delete("/user/deletePoint", async function (req, res) {
    let username = req.decoded.username;
    if (username !== "admin")
        res.status(401).send("You are not authorized to make that action");
    else{
        let point_id = req.query.point_id;
        var result = await poi_module.deletePoint(point_id);
        if (result instanceof Error) {
            console.log(result);
            res.status(400).send(result.message);
        } else {
            res.status(200).send(result);
        }
    }
});

app.delete("/user/deleteUser", async function (req, res) {
    let username = req.decoded.username;
    if (username !== "admin")
        res.status(401).send("You are not authorized to make that action");
    else{
        let username_delete = req.query.username_delete;
        var result = await poi_module.deleteUser(username_delete);
        if (result instanceof Error) {
            console.log(result);
            res.status(400).send(result.message);
        } else {
            res.status(200).send(result);
        }
    }
});

app.put("/user/updatePoint", async function (req, res) {
    let username = req.decoded.username;
    if (username !== "admin")
        res.status(401).send("You are not authorized to make that action");
    else{
        let point_id = req.query.point_id;
        let point_name = req.query.point_name;
        let category = req.query.category;
        let location = req.query.locatio;
        let description = req.query.descrip;
        let img_src = req.query.img_src;
        var result = await poi_module.updatePoint(point_id, point_name, category, location, description, img_src);
        if (result instanceof Error) {
            console.log(result);
            res.status(400).send(result.message);
        } else {
            res.status(200).send(result);
        }
    }
});

app.put("/user/createPoint", async function (req, res) {
    let username = req.decoded.username;
    if (username !== "admin")
        res.status(401).send("You are not authorized to make that action");
    else{
        let point_id = req.query.point_id;
        let point_name = req.query.point_name;
        let category = req.query.category;
        let location = req.query.location;
        let description = req.query.description;
        let img_src = req.query.img_src;
        var result = await poi_module.createPoint(point_name, category, location, description, img_src);
        if (result instanceof Error) {
            console.log(result);
            res.status(400).send(result.message);
        } else {
            res.status(200).send(result);
        }
    }
});



// app.put("/user/setCountries", async function (req, res) {
//     let username = req.decoded.username;
//     if (username !== "admin")
//         res.status(401).send("You are not authorized to make that action");
//     else{
//         let countries_xml_src = req.query.countries_xml_src;
//         var x = new XMLHttpRequest();
//         x.open("GET", 'https://www.dropbox.com/s/rh4dct91u8vj74x/countries.xml', true);
//         x.onreadystatechange = async function () {
//             if (x.readyState == 4 && x.status == 200) {
//                 var countries = this.responseText;
//                 let query = "DECLARE @XMLData XML\n" +
//                     "SET @XMLData ='" + countries + "'\n" +
//                     "        SELECT ID = Node.Data.value('(ID)[1]', 'INT')\n" +
//                     "            , [Name] = Node.Data.value('(Name)[1]', 'VARCHAR(50)')\n" +
//                     "        FROM    @XMLData.nodes('/Countries/Country') Node(Data)";
//                 var sqlResult = await DButilsAzure.execQuery(query);
//                 console.log(sqlResult);
//             }
//         };
//         x.send(null);
//         // if (result instanceof Error) {
//         //     console.log(result);
//         //     res.status(400).send(result.message);
//         // } else {
//         //     res.status(200).send(result);
//         // }
//     }
// });









