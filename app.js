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
    const token = req.header("x-auth-token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        next(); //move on to the actual function
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
});


app.post("/login", async function (req, res) {
    let Username = req.body.Username;
    let Password = req.body.Password;
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
    let Username = req.body.Username;
    let Password = req.body.Password;
    let Firstname = req.body.Firstname;
    let Lastname = req.body.Lastname;
    let City = req.body.City;
    let Country = req.body.CountryID;
    let Email = req.body.Email;
    let Interests = req.body.Interests;
    let QA = req.body.QA;
    var result = await user_module.register(Username, Password, Firstname, Lastname, City, Country, Email, Interests, QA);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(Username + " been added.");
    }
});

app.post("/user/updateUser", async function (req, res) {
    let Username = req.decoded.username;
    let Password = req.body.Password;
    let Firstname = req.body.Firstname;
    let Lastname = req.body.Lastname;
    let City = req.body.City;
    let Country = req.body.CountryID;
    let Email = req.body.Email;
    let Interests = req.body.Interests;
    let QA = req.body.QA;
    var result = await user_module.updateUser(Username, Password, Firstname, Lastname, City, Country, Email, Interests, QA);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(Username + " been added.");
    }
});

app.post("/passwordRetrieval", async function (req, res) {
    let Username = req.body.Username;
    let QA = req.body.QA;
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
    let user_details = req.body.user_details;
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

app.get("/user/getUserDetails", async function (req, res) {
    let user_details = req.body.user_details;
    var result = await user_module.getUserDetails(user_details);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});


app.get("/getPopularRandomPoints", async function (req, res) {
    let amountOfPoints = req.body.pointsAmount;
    let minRate = req.body.minRate;
    var result = await poi_module.getPopularRandomPoints(amountOfPoints, minRate);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.put("/user/writePointReview", async function (req, res) {
    let point_id = req.body.point_id;
    let stars = req.body.stars;
    let review_txt = req.body.review_txt;
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
    let point_id = req.body.point_id;
    var result = await poi_module.getClickedPointDetails(point_id);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getMostPopularPoints", async function (req, res) {
    let categories_name = req.body.categories_name;
    var result = await poi_module.getMostPopularPoints(categories_name);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getPointByName", async function (req, res) {
    let point_name = req.body.point_name;
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
    let userPoints = req.body.user_points;
    var result = await poi_module.saveUserPoints(username, userPoints);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getInterestPointReviews", async function (req, res) {
    let point_id = req.body.point_id;
    var result = await poi_module.getInterestPointReviews(point_id);
    if (result instanceof Error) {
        console.log(result);
        res.status(400).send(result.message);
    } else {
        res.status(200).send(result);
    }
});

app.get("/getPointByID", async function (req, res) {
    let point_id = req.body.point_id;
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
        let point_id = req.body.point_id;
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
        let username_delete = req.body.username_delete;
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
        let point_id = req.body.point_id;
        let point_name = req.body.point_name;
        let category = req.body.category;
        let location = req.body.location;
        let description = req.body.description;
        let img_src = req.body.img_src;
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
        let point_id = req.body.point_id;
        let point_name = req.body.point_name;
        let category = req.body.category;
        let location = req.body.location;
        let description = req.body.description;
        let img_src = req.body.img_src;
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
//         let countries_xml_src = req.body.countries_xml_src;
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









