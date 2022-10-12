/**
 * Function used to convert formatted currency (e.g. $500.00) to a number
 * @param  {String} value The formatted currency string
 * @return {Number}       The resultant number
 */
function currency_to_float(value) {
    return parseFloat(value.replace('$','').replace(',',''))
}

/**
 * Currency formatter; number object to formatted string
 * @param  {Number} value The number to format
 * @return {String}       The resultant string formatted as currency
 */
function format_currency(value) {
    const options = { style: 'currency', currency: 'MXN' };
    const formatter = new Intl.NumberFormat('es-MX', options);
    
    return formatter.format(value);
}

/**
 * Format date (in milliseconds since EPOCH) to local date + time string
 * @param  {Number} millis The milliseconds since EPOCH
 * @return {String}        The resultant formatted date as string
 */
function format_date(millis) {
    const fecha_pre = new Date(millis);
    console.log(fecha_pre);
    
    const date = fecha_pre.toLocaleString('es-MX').split(' ')[0];
    const time = fecha_pre.toLocaleString('es-MX').split(' ')[1].split(':');
  
    return date + ' ' + time[0] + ":" + time[1];
}

/**
 * Format date (in milliseconds since EPOCH) to local date + time that can be used as a value of a datetime-local form input
 * @param  {Date} date The date object
 * @return {String}    The resultant formatted date as string
 */
function date_to_form_string(date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0,16);
}

/**
 * Convert date input constant to a variable
 * @param  {Date} date The date object
 * @return {Number}    The milliseconds since EPOCH
 */
function date_to_millis(date) {
    const date_2 = date.getUTCDate();
    date.setDate(date_2);

    return date.getTime(); //Convert Date object to milliseconds after EPOCH (I think), to store it in database
}

/**
 * Sort transactions object from Firebase Realtime Database by date (most recent at the top)
 * @param  {Object} transactions The transactions object which comes from Firebase Realtime Database
 * @return {Object}              The sorted transactions object
 */
function sort_transactions(transactions) {
    var array = [];
    for (const trans_id in transactions) {
        array.push([trans_id, transactions[trans_id]]);
    }

    array.sort((a, b) => {
        return b[1].date - a[1].date;
    });

    var sorted = new Object();
    for (index in array) {
        let acc = array[index];

        sorted[acc[0]] = acc[1];
    }

    return sorted;
}

/**
 * Update the balance of an account by adding the amount of a transaction (i.e., does not set absolute value).
 * @param  {String} account_name The name of the account to be updated
 * @param  {String} uid          The id of the user account
 * @param  {Number} amount       The amount of the transaction
 * @param  {}       admin        The firebase admin SDK
 */
function update_balance(account_name, uid, amount, admin) {
    var db = admin.database(); //Start Firebase Realtime Database object

    db.ref(`accounts`).orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
        var data = snapshot.val();
        
        var acc_id = "";

        for (const id in data) {
            if (data[id].name == account_name) {
                acc_id = id;
                break;
            }
        }

        const ref = db.ref(`accounts/${acc_id}/balance`);
        ref.transaction((current_value) => {
            return (current_value || 0) + amount;
        });
    });
}

/**
 * Update the balance of a project by adding the amount of a transaction (i.e., does not set absolute value).
 * @param  {String} project_name The name of the project to be updated
 * @param  {String} uid          The id of the user account
 * @param  {Number} amount       The amount of the transaction
 * @param  {}       admin        The firebase admin SDK
 */
 function update_proj_balance(project_name, uid, amount, admin) {
    var db = admin.database(); //Start Firebase Realtime Database object

    db.ref(`projects`).orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
        var data = snapshot.val();
        
        var proj_id = "";

        for (const id in data) {
            if (data[id].name == project_name) {
                proj_id = id;
                break;
            }
        }

        const ref = db.ref(`project/${proj_id}/balance`);
        ref.transaction((current_value) => {
            return (current_value || 0) + amount;
        });
    });
}

/**
 * Update the balance of a category by adding the amount of a transaction (i.e., does not set absolute value).
 * @param  {String} category_name The name of the category to be updated
 * @param  {String} uid          The id of the user account
 * @param  {Number} amount       The amount of the transaction
 * @param  {}       admin        The firebase admin SDK
 */
 function update_cat_balance(project_name, uid, amount, admin) {
    var db = admin.database(); //Start Firebase Realtime Database object

    db.ref(`categories`).orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
        var data = snapshot.val();
        
        var cat_id = "";

        for (const id in data) {
            if (data[id].name == project_name) {
                cat_id = id;
                break;
            }
        }

        const ref = db.ref(`category/${cat_id}/balance`);
        ref.transaction((current_value) => {
            return (current_value || 0) + amount;
        });
    });
}

/**
 * Returns the uid from a token
 * @param  {String}   req         Request
 * @param  {Auth}     auth        The firebase Auth object
 * @param  {Function} next        Success function
 * @param  {Function} error_func  Error function
 */
function auth(req, auth, next, error_func) {
    const token = req.cookies["token"];
    console.log(token);

    if (token == null || token == "" || token == undefined) {
        error_func("no token!");
    }

    console.log("verifying...")

    auth
        .verifyIdToken(token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            //console.log(uid);
            //auth.get
            next(uid);
        })
        .catch((error) => {
            // Handle error
            console.log(error);
            error_func(error);
        });
}

module.exports = { currency_to_float, format_currency, format_date, date_to_form_string, date_to_millis, sort_transactions, update_balance, update_proj_balance, update_cat_balance, auth };