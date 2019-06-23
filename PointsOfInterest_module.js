
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");

async function getAllPoints() {
    return await DButilsAzure.execQuery("SELECT * FROM point_of_interest");
}

module.exports.getAllPoints = getAllPoints;

async function getPointsByCategory(category) {
    console.log(category);
    return await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE category = '" + category + "'");
}
module.exports.getPointsByCategory = getPointsByCategory;

async function getAllCategories() {
    return await DButilsAzure.execQuery("SELECT * FROM category");
}
module.exports.getAllCategories = getAllCategories;


function getDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '/' + mm + '/' + dd;
    return today;
}

async function getClickedPointDetails(point_id) {
    try {
        await advanceViews(point_id);
        let pointDetails = await DButilsAzure.execQuery("SELECT point_name, description, views_num, avg_rate FROM point_of_interest WHERE point_id = '" + point_id + "'");
        let pointReviews = await DButilsAzure.execQuery("SELECT * FROM poi_review WHERE point_id = '" + point_id + "' ORDER BY date DESC");
        if (pointReviews.length <= 2)
            pointDetails.push(pointReviews);
        else {
            pointDetails.push(pointReviews[0]);
            pointDetails.push(pointReviews[1]);
        }
        return pointDetails;
    } catch (e) {
        return new Error("Point_id is invalid");
    }


}

module.exports.getClickedPointDetails = getClickedPointDetails;

async function advanceViews(point_id) {
    let update = "UPDATE point_of_interest";
    let set = "SET";
    let where = "WHERE point_id = '" + point_id + "'";
    let currCounter = await DButilsAzure.execQuery("SELECT views_num FROM point_of_interest WHERE point_id = '" + point_id + "'");
    let newCounter = parseInt(currCounter["0"].views_num) + 1;
    await DButilsAzure.execQuery("UPDATE point_of_interest SET views_num = '" + newCounter + "' WHERE point_id = '" + point_id + "'");
}

async function getPointByName(point_name) {
    try {
        let point = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE point_name LIKE '%" + point_name + "%'");
        if (point.length !== 0){
            await advanceViews(point["0"].point_id);
            return point;
        }
    } catch (e) {
        return e;
    }
}

module.exports.getPointByName = getPointByName;

async function getPointByID(point_id) {
    try {
        let point = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE point_id = '" + point_id + "'");
        if (point.length !== 0){
            await advanceViews(point_id);
            return point;
        }
    } catch (e) {
        return e;
    }
}

module.exports.getPointByID = getPointByID;

async function deletePoint(point_id) {
    try{
        let point = await DButilsAzure.execQuery("DELETE FROM poi_reviews WHERE point_id = '" + point_id + "'");
    }catch (e) {
    }
    try{
        let point = await DButilsAzure.execQuery("DELETE FROM points_of_users WHERE point_id = '" + point_id + "'");
    }catch (e) {
    }
    try{
        let point = await DButilsAzure.execQuery("DELETE FROM point_of_interest WHERE point_id = '" + point_id + "'");
    }catch (e) {
    }
    return "Point have been deleted";

}
module.exports.deletePoint = deletePoint;

async function updatePoint(point_id, point_name, category, location, description, img_src) {
    var sqlResult = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE point_id = '" + point_id + "'");
    if (sqlResult.length === 0)
        return new Error("point_id isn't exists.");

    let update = "UPDATE point_of_interest";
    let set = "SET";
    let where = "WHERE point_id = '" + point_id + "'";

    if (point_name !== undefined)
        set += " point_name ='" + point_name + "', ";
    if (category !== undefined)
        set += " category ='" + category + "', ";
    if (location !== undefined)
        set += " location ='" + location + "', ";
    if (description !== undefined)
        set += " description ='" + description + "', ";
    if (img_src !== undefined)
        set += " img_src ='" + img_src + "', ";

    set = set.substring(0, set.length-2);
    let query = update + " " + set + " " + where;

    return await DButilsAzure.execQuery(query);

}

module.exports.updatePoint = updatePoint;


async function createPoint(point_name, category, location, description, img_src) {
    let sqlRes = await DButilsAzure.execQuery("SELECT * FROM category WHERE category = '" + category + "'");
    if (sqlRes.length === 0){
        return new Error("Illegal Category, Please choose exist category or add new category first");
    }
    sqlRes = await DButilsAzure.execQuery("INSERT INTO point_of_interest (point_name, category, location, description, img_src)" +
        "VALUES ('" + point_name + "','" + category + "','" + location + "','" + description + "','" + img_src + "')");
    return "New point added, its point_id: ";
}
module.exports.createPoint = createPoint;

async function deleteUser(username_delete) {
    try{
        await DButilsAzure.execQuery("DELETE FROM authen_qa_of_users WHERE username = '" + username_delete + "'");
    }catch (e) {
    }
    try{
        await DButilsAzure.execQuery("DELETE FROM points_of_users WHERE username = '" + username_delete + "'");
    }catch (e) {
    }
    try{
        await DButilsAzure.execQuery("DELETE FROM categories_of_users WHERE username = '" + username_delete + "'");
    }catch (e) {
    }
    try{
        await DButilsAzure.execQuery("DELETE FROM poi_review WHERE username = '" + username_delete + "'");
    }catch (e) {
    }
    try{
        let user = await DButilsAzure.execQuery("DELETE FROM [user] WHERE username = '" + username_delete + "'");
        if (user.length === 0)
            return 'There is not such username "' + username_delete + '".';
    }catch (e) {
    }
    return "Username: " + username_delete +" have been deleted";


}
module.exports.deleteUser = deleteUser;



async function getInterestPointReviews(point_id) {
    try {
        return await DButilsAzure.execQuery("SELECT * FROM poi_review WHERE point_id = '" + point_id + "'");
    } catch (e) {
        return e;
    }

}
module.exports.getInterestPointReviews = getInterestPointReviews;




async function getMostPopularPoints(categories_name) {
    try {
        let ans = [];
        for (let i = 0; i < categories_name.length; i++) {
            let single = JSON.parse(categories_name[i]);
            let mostPopCatPoint = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE category = '" + single.category + "' ORDER BY views_num DESC");
            if (mostPopCatPoint.length !== 0){
                await advanceViews(mostPopCatPoint["0"].point_id);
                ans.push(mostPopCatPoint[0]);

            }
        }
        return ans;
    } catch (e) {
        return e;
    }
}

module.exports.getMostPopularPoints = getMostPopularPoints;

async function saveUserPoints(username, user_points) {
    await DButilsAzure.execQuery("DELETE FROM points_of_users WHERE username = '" + username + "'");
    user_points = JSON.parse(user_points);
    let totalPoints = user_points.length; // How many points the user ask to save
    let savedPoints = 0; // Counts the new point that save
    for (let i = 0; i < user_points.length; i++) {
        try {
            await DButilsAzure.execQuery("INSERT INTO points_of_users (point_id, username)" +
                "VALUES ('" + user_points[i] + "','" + username + "')");
            savedPoints++;
        } catch (e) {

        }
    }
    return savedPoints + " Saved out of " + totalPoints + ". " + "The rest was on user list before or doesn't exits." ;
}

module.exports.saveUserPoints = saveUserPoints;


async function getUserSavedPoints(username) {
    let ans = [];
    let userPointsID = await DButilsAzure.execQuery("SELECT point_id FROM points_of_users WHERE username = '" + username + "'");
    for (let i = 0; i < userPointsID.length; i++) {
        let point = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE point_id = '" + userPointsID[i].point_id + "'");
        if (point.length !== 0)
            ans.push(point);
    }
    return ans;
}

module.exports.getUserSavedPoints = getUserSavedPoints;


async function writePointReview(username, point_id, stars, review_txt) {
    let reviewParamsValidMsg = await reviewParamsIsValid(username, point_id, stars);
    if (reviewParamsValidMsg === "Valid") {
        try {
            let today_date = getDate();
            await DButilsAzure.execQuery("INSERT INTO poi_review (username, point_id, stars, review_text, date)" +
                "VALUES ('" + username + "','" + point_id + "','" + stars + "','" + review_txt + "','" + today_date + "')");
            let avgStars = await DButilsAzure.execQuery("SELECT AVG(stars) FROM poi_review WHERE point_id = '" + point_id + "'");
            let new_rate = avgStars["0"][""] / 5 * 100;
            await DButilsAzure.execQuery("UPDATE point_of_interest SET avg_rate = '" + new_rate + "' " + "WHERE point_id = '" + point_id + "'");
            return true;
        } catch (e) {
            return e;
        }

    } else {
        return new Error(reviewParamsValidMsg);
    }
}

module.exports.writePointReview = writePointReview;


function randomNum(min, max, nums) {
    let n = [];
    for (let i = 0; i < nums; i++) {
        let newNum = Math.floor(Math.random() * max) + min;
        while (n.includes(newNum))
            newNum = Math.floor(Math.random() * max) + min;
        n.push(newNum);
    }
    return n;
}

async function getPopularRandomPoints(amountOfPoints, minRate) {
    let avg_rate = await DButilsAzure.execQuery("SELECT AVG(avg_rate) FROM point_of_interest");
    // execQuery("SELECT password FROM [user] WHERE username = '" + Username + "'");
    if (amountOfPoints === undefined)
        amountOfPoints = 3;
    if (minRate === undefined)
        minRate = avg_rate["0"][""];
    let allRelevantPoints = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE avg_rate >= " + minRate);
    if (allRelevantPoints.length <= 3)
        return allRelevantPoints;
    else {
        let res = [];
        let random_indexes = randomNum(0, allRelevantPoints.length - 1, amountOfPoints);
        for (let i = 0; i < random_indexes.length; i++) {
            res.push(allRelevantPoints[i]);
        }
        return res;
    }
}

module.exports.getPopularRandomPoints = getPopularRandomPoints;


async function reviewParamsIsValid(username, point_id, stars) {
    if (!/^[1-5]+$/.test(stars) || stars.length !== 1)
        return "Illegal start number, The legal range is 1-5";
    let point = await DButilsAzure.execQuery("SELECT * FROM point_of_interest WHERE point_id = '" + point_id + "'");
    if (point.length === 0)
        return "The point_id isn't exist";
    let usernameSQL = await DButilsAzure.execQuery("SELECT * FROM [user] WHERE username = '" + username + "'");
    if (usernameSQL.length === 0)
        return "Username is illegal";

    return "Valid";
}