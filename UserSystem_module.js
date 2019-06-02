
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");

async function login(Username, Password) {
    try {
        let secret = "secret";
        if (Username === undefined)
            return new Error("Please fill your Username");
        if (Password === undefined)
            return new Error("Please fill your Password");

        var sqlResult = await DButilsAzure.execQuery("SELECT * FROM [user] WHERE username = '" + Username + "' AND password = '" + Password + "'");
        if (sqlResult.length === 0) {
            return new Error("Username / Password is incorrect, Please try again");
        } else {
            payload = {username: Username};
            options = {expiresIn: "1d"};
            const token = jwt.sign(payload, secret, options);
            return token;
        }
    } catch (err) {
        return err;
    }
}

module.exports.login = login;

async function register(Username, Password, Firstname, Lastname, City, CountryID, Email, Interests, QA) { // Firstname, Lastname and City can be null
    try {
        QA = JSON.parse(QA);
        Interests = JSON.parse(Interests);
        var registerErrors;
        registerErrors = await checkRegisterValidation(Username, Password, CountryID, Email, Interests, QA);
        if (registerErrors instanceof Error)
            return registerErrors;
        insertToDBTables(Username, Password, Firstname, Lastname, City, CountryID, Email, Interests, QA);
    } catch
        (err) {
        if (err.number === 2627) {
            return new Error("Illegal Username - The Username is already exist, Please try another Username");
        } else {
            return err;
        }
    }
}

module.exports.register = register;

async function getFullUserDetails(user_detail) {
    return await DButilsAzure.execQuery("SELECT * FROM [user] WHERE username = '" + user_detail + "'");
}
module.exports.getFullUserDetails = getFullUserDetails;

async function getUserDetails(user_details) {
    return await DButilsAzure.execQuery("SELECT [user].username, [user].first_name, [user].last_name, [user].city, country.country_name, c.category " +
        "FROM [user] " +
        "INNER JOIN country on [user].country_id = country.country_id " +
        "INNER JOIN categories_of_users c on [user].username = c.username " +
        "WHERE [user].username = '" + user_details + "'");
}
module.exports.getUserDetails = getUserDetails;



async function updateUser(Username, Password, Firstname, Lastname, City, Country, Email, Interests, QA) {
    try {
        if (QA !== undefined)
            QA = JSON.parse(QA);
        if (Interests !== undefined)
            Interests = JSON.parse(Interests);
        // let registerErrors = await checkRegisterValidation("Username", Password, Country, Email, Interests, QA);
        // if (registerErrors instanceof Error)
        //     return registerErrors;

        let update = "UPDATE [user]";
        let set = "SET";
        let where = "WHERE username = '" + Username + "'";

        if (Password !== undefined && passwordIsValid(Password)){}
            set += " password ='" + Password + "', ";
        if (Firstname !== undefined)
            set += " first_name ='" + Firstname + "', ";
        if (Lastname !== undefined)
            set += " last_name ='" + Lastname + "', ";
        if (City !== undefined)
            set += " city ='" + City + "', ";
        if (Country !== undefined && countryIsValid(Country))
            set += " country_id ='" + Country + "', ";
        if (Email !== undefined && emailIsValid(Email))
            set += " email ='" + Email + "', ";
        // if (Interests !== undefined && interestsIsValid(Interests))
        //     set += " img_src ='" + img_src + "', ";
        // if (QA !== undefined && QAIsValid(QA))
        //     set += " img_src ='" + img_src + "', ";

        set = set.substring(0, set.length - 2);
        let query = update + " " + set + " " + where;

        return await DButilsAzure.execQuery(query);
    }catch(err) {
        if (err.number === 2627) {
            return new Error("Illegal Username - The Username is already exist, Please try another Username");
        } else {
            return err;
        }
    }
}

module.exports.updateUser = updateUser;


async function passwordRetrieval(Username, QA_sent) {
    var sqlRes = await DButilsAzure.execQuery("SELECT * FROM [user] WHERE username = '" + Username + "'");
    if (QA_sent === undefined || QA_sent.length === 0 || sqlRes.length === 0)
        return new Error("Illegal input");
    QA_sent = JSON.parse(QA_sent);
    try {
        for (let i = 0; i < QA_sent.length; i++) {
            var sqlRes = await DButilsAzure.execQuery("SELECT * FROM authen_qa_of_users WHERE username = '" + Username + "'  AND question = '" + QA_sent[i].ques + "'  AND answer = '" + QA_sent[i].ans + "'");
            if (sqlRes.length === 0)
                return new Error("One of the answers is incorrect");
        }
        return await DButilsAzure.execQuery("SELECT password FROM [user] WHERE username = '" + Username + "'");
    } catch (e) {
        return e;
    }


}

module.exports.passwordRetrival = passwordRetrieval;


async function getUserAuthenQA(userName) {
    const realQA = await DButilsAzure.execQuery("SELECT question, answer FROM authen_qa_of_users WHERE username = '" + userName + "'");
    console.log(realQA);
    return realQA;

}


async function insertToDBTables(Username, Password, Firstname, Lastname, City, CountryID, Email, Interests, QA) {
    try {
        const userTableQuery = await DB_insertToUserTable(Username, Password, Firstname, Lastname, City, CountryID, Email);
        const categoryOfUsersQuery = await DB_insertToUsersCategoriesTable(Username, Interests);
        const authenQAOfUsersQuery = await DB_insertToQATables(Username, Interests, QA);
    } catch (e) {
        return e;
    }
}

async function DB_insertToUserTable(Username, Password, Firstname, Lastname, City, CountryID, Email) {
    sqlResult = await DButilsAzure.execQuery("INSERT INTO [user] (username, password, first_name, last_name, city, country_id, email)" +
        "VALUES ('" + Username + "','" + Password + "','" + Firstname + "','" + Lastname + "','" + City + "','" + CountryID + "','" + Email + "')")
}

async function DB_insertToQATables(Username, Interests, QA) {
    for (let i = 0; i < QA.length; i++) {
        sqlResult = await DButilsAzure.execQuery("INSERT INTO authen_qa_of_users (answer, username, question)" +
            "VALUES ('" + QA[i].ans + "','" + Username + "','" + QA[i].ques + "')")
    }
}

async function DB_insertToUsersCategoriesTable(Username, Interests) {
    for (let i = 0; i < Interests.length; i++) {
        sqlResult = await DButilsAzure.execQuery("INSERT INTO categories_of_users (category, username)" +
            "VALUES ('" + Interests[i] + "','" + Username + "')");
    }
}


async function checkRegisterValidation(Username, Password, Country, Email, Interests, QA) {
    let flag = true;

    if (!usernameIsValid(Username)) {
        return new Error("Illegal Username - Please enter a 3-8 character username that contains letters only");
    }
    if (!passwordIsValid(Password)) {
        return new Error("Illegal Password - Please enter a 5-10 character password that contains letters and numbers only.");
    }
    const countryIsValidFlag = await countryIsValid(Country);
    if (!countryIsValidFlag) {
        return new Error("Illegal Country - Please choose country from the following list.");
    }
    if (emailIsValid(Email) !== "Valid") {
        return new Error("Illegal Email - Please enter a legal email");
    }
    const interestsValidCheckMsg = await interestsIsValid(Interests);
    if (interestsValidCheckMsg !== "Valid") {
        return new Error(interestsValidCheckMsg);
    }
    const QAValidCheckMsg = await QAIsValid(QA);
    if (QAValidCheckMsg !== "Valid") {
        return new Error(QAValidCheckMsg);
    }
    return flag; // true if no errors if all valid.
}

function usernameIsValid(Username) {
    if (Username === undefined || Username.length > 8 || Username.length < 3 || !/^[a-zA-Z]+$/.test(Username))
        return false;
    return true;
}

function passwordIsValid(Password) {
    if (Password === undefined || Password.length > 10 || Password < 5 || !/^[a-zA-Z0-9]+$/.test(Password))
        return false;
    return true;
}

async function countryIsValid(country_id) {
    try {
        var sqlResult = await DButilsAzure.execQuery("SELECT * FROM country WHERE country_id = '" + country_id + "'");
        if (sqlResult.length === 0)
            return false;
        return true;
    } catch (e) {
        return false;
    }
}

function emailIsValid(Email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(Email).toLowerCase()))
        return "Valid";
    else
        return "Illegal Email.";
}

/**
 *
 * @param Interests - Array of Strings, each string represents Interest (Category).
 * @returns {boolean}
 */

async function interestsIsValid(Interests) {
    if (Interests === undefined || Interests.length < 2)
        return "Illegal Interests, Please select at least 2 Interests";
    for (let i = 0; i < Interests.length; i++) {
        var sqlResult = await DButilsAzure.execQuery("SELECT * FROM category WHERE category = '" + Interests[i] + "'");
        if (sqlResult.length === 0)
            return "Illegal Interests, Please select from the following list";
    }
    return "Valid";
}

/**
 * @return {boolean}
 */
async function QAIsValid(QA) {
    if (QA === undefined)
        return false;
    if (QA.length < 2) {
        return "For your security, Please provide answer to at least 2 authentication questions";
    }
    for (let i = 0; i < QA.length; i++) {
        if (QA[i].ques === undefined || QA[i].ans === undefined)
            return "For your security, Please provide answer to at least 2 authentication questions";
        var sqlResult = await DButilsAzure.execQuery("SELECT * FROM authen_question WHERE question = '" + QA[i].ques + "'");
        if (sqlResult.length === 0)
            return "Please choose legal authentication questions";
    }
    return "Valid";
}


