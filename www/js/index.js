// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        console.log('Portrait.');
    }
    else {
        console.log('Landscape.');
    }
}

function changePopup(sourcePopup, destinationPopup) {
    var afterClose = function () {
        destinationPopup.popup("open");
        sourcePopup.off("popupafterclose", afterClose);
    };

    sourcePopup.on("popupafterclose", afterClose);
    sourcePopup.popup("close");
}
var el = document.querySelector('.ui-grid-a');
el.innerHTML = el.innerHTML.replace(/&nbsp;/g, '');

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

// Display messages in the console.
function log(message) {
    console.log(`[${new Date()}] ${message}`);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`Errors when executing SQL query. [Code: ${error.code}] [Message: ${error.message}]`);
}

$(document).on('vclick', ' #cancel', function () {
    $('#page-create #frm-confirm').popup('close');
});

// Run this function after starting the application.
function onDeviceReady() {
    prepareDatabase(db)
}

const Furniture = {
    "Unfurnished": 0,
    "Half Furnished": 1,
    "Furnished": 2
};

const Type = {
    "Apartment": 0,
    "Penthouse": 1,
    "House": 2,
    "Villa": 3
};



$(document).on('pagebeforeshow', '#page-create', function () {
    prepareForm('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #city', function () {
    importDistrict($('#page-create #frm-register #distrit'), this.value);
    importWard($('#page-create #frm-register #ward'), -1);
});

$(document).on('change', '#page-create #frm-register #distrit', function () {
    importWard($('#page-create #frm-register #ward'), this.value);
});



function prepareForm(form) {
    importAddress($(`${form} #city`), 'City');
    importDistrict($(`${form} #distrit`), -1);
    importWard($(`${form} #ward`), -1);

    importOpption($(`${form} #furniture`), Furniture, 'Furniture');
    importOpption($(`${form} #type`), Type, 'Type');
}



function importDistrict(form, selectedId, selectedValue = -1) {
    importAddress(form, 'District', selectedValue, `WHERE CityId = ${selectedId}`);
}
function importWard(form, selectedId, selectedValue = -1) {
    importAddress(form, 'Ward', selectedValue, `WHERE DistrictId = ${selectedId}`);
}


function importAddress(form, name, selectedValue = -1, selectedName = '') {
    db.transaction(function (tx) {
        let query = `SELECT * FROM ${name} ${selectedName} ORDER BY Name`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            let optionList = `<option value='1'>Slect ${name}</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}' ${item.Id == selectedValue ? 'selected' : ''}>${item.Name}</option>`
            }
            form.html(optionList);
            form.selectmenu('refresh', true);
        }
    });
}

function importOpption(select, listItem, name, selectedValue = -1) {
    let optionList = `<option value="-1">Select ${name}</option>`;

    for (var key in listItem) {
        optionList += `<option value="${listItem[key]}" ${listItem[key] == selectedValue ? 'selected' : ''}>${key}</option>`;
    }

    select.html(optionList);
    select.selectmenu('refresh', true);
}




$(document).on('submit', '#page-create #frm-confirm', registerProperty);
$(document).on('submit', '#page-create #frm-register', confirmProperty);

function confirmProperty(e) {
    e.preventDefault()

        let Name = $('#page-create #frm-register #name').val();
        let Street = $('#page-create #frm-register #address').val();
        let Type = $('#page-create #frm-register #type option:selected').text();
        let City = $('#page-create #frm-register #city option:selected').text();
        let District = $('#page-create #frm-register #distrit option:selected').text();
        let Ward = $('#page-create #frm-register #ward option:selected').text();
        let Furniture = $('#page-create #frm-register #furniture option:selected').text();
        let Bedroom = $('#page-create #frm-register #bedrooms').val();
        let Price = $('#page-create #frm-register #price').val();
        let Reporter = $('#page-create #frm-register #reporter').val();
        let Note = $('#page-create #frm-register #note').val();
        
        db.transaction(function (tx) {
            let query = 'SELECT * FROM Property WHERE Name = ?';
            tx.executeSql(query, [Name], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
               
                if (result.rows[0] == null) {
                    log('Open the confirmation popup.');
                    $('#page-create #error').empty();
                    $('#page-create #frm-confirm #name').text(Name)
                    $('#page-create #frm-confirm #address').text(Street)
                    $('#page-create #frm-confirm #city').text(City)
                    $('#page-create #frm-confirm #district').text(District)
                    $('#page-create #frm-confirm #ward').text(Ward)
                    $('#page-create #frm-confirm #type').text(Type)
                    $('#page-create #frm-confirm #bedroom').text(Bedroom)
                    $('#page-create #frm-confirm #price').text(Price)
                    $('#page-create #frm-confirm #furniture').text(Furniture)
                    $('#page-create #frm-confirm #reporter').text(Reporter)
                    $('#page-create #frm-confirm #note').text(Note)
                   
                    $('#page-create #frm-confirm').popup('open'); 
                }
                else {
                    let error = 'Name exists.';
                    $('#page-create #error').empty().append(error);
                    // log(error, ERROR);
                }
            }
        });
}

function registerProperty(e) {
    e.preventDefault();
    let Name = $('#page-create #frm-register #name').val();
    let Street = $('#page-create #frm-register #address').val();
    let City = $('#page-create #frm-register #city').val();
    let District = $('#page-create #frm-register #distrit').val();
    let Ward = $('#page-create #frm-register #ward').val();
    let Type = $('#page-create #frm-register #type').val();
    let Furniture = $('#page-create #frm-register #furniture').val();
    let Bedroom = $('#page-create #frm-register #bedrooms').val();
    let Price = $('#page-create #frm-register #price').val();
    let Reporter = $('#page-create #frm-register #reporter').val();
    let Note = $('#page-create #frm-register #note').val();
    

    db.transaction(function (tx) {
        let query = `INSERT INTO Property (Name, Street, City, District, Ward, Type, Bedroom, Price, Furniture, Reporter, DateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, julianday('now'))`;
        tx.executeSql(query, [Name, Street, City, District, Ward, Type, Bedroom, Price, Furniture, Reporter], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a username '${Name}' successfully.`);
            log(result)

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#page-create #frm-register #name').focus();
            $('#page-create #frm-confirm').popup('close');
            
            if (Note != '') {
                db.transaction(function (tx) {
                    let query = `INSERT INTO Note (Message, PropertyId, Datatime) VALUES (?, ?, julianday('now'))`;
                    tx.executeSql(query, [Note, result.insertId], transactionSuccess, transactionError);

                    function transactionSuccess(tx, result) {
                        log(`Add new note to property '${Name}' successfully.`);
                    }
                });
            }
        }

    });
}


$(document).on('pagebeforeshow', '#page-list', showList);
function showList() {
    db.transaction(function (tx) {
        let query = `SELECT Property.Id AS Id, Property.Name AS Name, Price, Bedroom, Type, City.Name AS City FROM Property LEFT JOIN City ON Property.City = City.Id`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of accounts successfully.`);
            
            // Prepare the list of accounts.
            let listAccount = `<ul class="ui-nodisc-icon ui-alt-icon  ui-listview">`;
            for (let property of result.rows) {
                const { Name, City, Bedroom, Price } = property
                listAccount += `<li >
                <a data-details='{"Id" : ${property.Id}}' class="ui-btn-icon-right ui-icon-carat-r" >
                                    <h2 style="color:black; font-weight: 700; margin-bottom: 0px; font-size: 18px">${Name}</h2>
                                    <p style="color:black; font-size: 14px; margin-bottom: 8px">${City}</p>
                                     <div class="detail-list">
                                     <div>
                                        <img src="./img/icon-bedroom.png" style="height: 20px; background: transparent; margin-bottom: -5px;" alt="">
                                        <span style="color:black; font-weight: 500;  ">${Bedroom}<span>
                                     </div>
                                   <div>
                                        <img src="./img/icon-type.png" style="height: 20px; background: transparent; margin-bottom: -5px;" alt="">
                                        <span style="color:black, font-weight: 500 ">${Object.keys(Type)[property.Type]}<span>
                                 </div>
                                 <div>
                                        <img src="./img/icon-price.png" style="height: 20px; background: transparent; margin-bottom: -5px;" alt="">
                                        <span style="color:black, font-weight: 500;">${Price.toLocaleString('en-US')} VNĐ / month<span>
                                 </div>
                                </div>
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.
            $('#page-list #list-account').empty().append(listAccount).listview('refresh').trigger('create');
            log(`Show list of accounts successfully.`);
        }
    });
}


// Save Account Id.
$(document).on('vclick', '#list-account li a', function (e) {
    e.preventDefault();

    let id = $(this).data('details').Id;
    localStorage.setItem('propertyId', id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('propertyId');

    db.transaction(function (tx) {
        let query = `SELECT Property.*, datetime(Property.DateAdded, '+7 hours') AS Date, Note.Message AS Note, City.Name AS City, District.Name AS District, Ward.Name AS Ward
                     FROM Property
                     LEFT JOIN City ON City.Id = Property.City
                     LEFT JOIN District ON District.Id = Property.District
                     LEFT JOIN Ward ON Ward.Id = Property.Ward
                     LEFT JOIN Note ON Note.PropertyId = Property.Id
                     WHERE Property.Id = ? `;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            let errorMessage = 'Account not found.';
            console.log(result)
            if (result.rows[0] != null) {
                log(`Get details of account '${result}' successfully.`);
                name = result.rows[0].Name;
                street = result.rows[0].Street;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward
                type = Object.keys(Type)[result.rows[0].Type];
                bedroom = result.rows[0].Bedroom;
                price = result.rows[0].Price;
                furniture = Object.keys(Furniture)[result.rows[0].Furniture];
                reporter = result.rows[0].Reporter;
                dateAdded = result.rows[0].Date;
                note = result.rows[0].Note;
            }
            else {
                log(errorMessage, ERROR);
                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }
            $('#page-detail #name').text(name);
            $('#page-detail #street').text(street);
            $('#page-detail #ward').text(ward);
            $('#page-detail #district').text(district);
            $('#page-detail #city').text(city);
            $('#page-detail #type').text(type);
            $('#page-detail #bedroom').text(bedroom);
            $('#page-detail #price').text(`${price.toLocaleString('en-US')} VNĐ / month`);
            $('#page-detail #furniture').text(furniture);
            $('#page-detail #date').text(dateAdded);
            $('#page-detail #note').text(note);
            showComment();
        }
    });
}

// Delete Account.
$(document).on('submit', '#page-detail #frm-delete', deleteAccount);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeleteAccount);

function confirmDeleteAccount() {
    let text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

function deleteAccount(e) {
    e.preventDefault();

    let id = localStorage.getItem('propertyId');

    db.transaction(function (tx) {
        let query = 'DELETE FROM Property WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete property '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}




$(document).on('submit', '#page-detail #frm-comment', addComment);

function addComment(e) {
    e.preventDefault();

    let propertyId = localStorage.getItem('propertyId');
    let message = $('#page-detail #frm-comment #txt-comment').val();

    db.transaction(function (tx) {
        let query = `INSERT INTO Note (PropertyId, Message, Datatime) VALUES (?, ?, julianday('now'))`;
        tx.executeSql(query, [propertyId, message], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new comment to account '${propertyId}' successfully.`);

            $('#page-detail #frm-comment').trigger('reset');

            showComment();
        }
    });
}

// Show Comment.
function showComment() {
    let propertyId = localStorage.getItem('propertyId');

    db.transaction(function (tx) {
        let query = `SELECT Message, datetime(Datatime, '+7 hours') AS Datatime FROM Note WHERE PropertyId = ?`;
        tx.executeSql(query, [propertyId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of comments successfully.`);

            // Prepare the list of comments.
            let listComment = '';
            for (let comment of result.rows) {
                listComment += `<div class = 'list'>
                                      <small>${comment.Datatime}</small>
                                    <h3>${comment.Message}</h3>
                                </div>`;
            }

            // Add list to UI.
            $('#list-comment').empty().append(listComment);

            log(`Show list of comments successfully.`);
        }
    });
}

$(document).on('pagebeforeshow', '#page-detail', function () {
    prepareForm('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #city', function () {
    importDistrict($('#page-detail #frm-update #distrit'), this.value);
    importWard($('#page-detail #frm-update #ward'), -1);
});

$(document).on('change', '#page-detail #frm-update #distrit', function () {
    importWard($('#page-detail #frm-update #ward'), this.value);
});

$(document).on('vclick', '#page-detail #btn-update', showUpdate);
$(document).on('submit', '#page-detail #frm-update', updateProperty);

function showUpdate() {
    let id = localStorage.getItem('propertyId');
    db.transaction(function (tx) {
        let query = `SELECT * FROM Property WHERE Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].Name}' successfully.`);

                $(`#page-detail #frm-update #name`).val(result.rows[0].Name)
                $(`#page-detail #frm-update #address`).val(result.rows[0].Street)
                $(`#page-detail #frm-update #price`).val(result.rows[0].Price)
                $(`#page-detail #frm-update #bedrooms`).val(result.rows[0].Bedroom)
                $(`#page-detail #frm-update #reporter`).val(result.rows[0].Reporter)
                $(`#page-detail #frm-update #note`).val(result.rows[0].Note)
                importOpption($(`#page-detail #frm-update #type`), Type, 'Type', result.rows[0].Type)
                importOpption($('#page-detail #frm-update #furniture'), Furniture, 'Furniture', result.rows[0].Furniture);
                importAddress($('#page-detail #frm-update #city'), 'City', result.rows[0].City);
                importDistrict($('#page-detail #frm-update #distrit'), result.rows[0].City, result.rows[0].District);
                importWard($('#page-detail #frm-update #ward'), result.rows[0].District, result.rows[0].Ward);
            }
        }
    });
}

$(document).on('submit', '#page-detail #frm-update', updateProperty)
function updateProperty(e) {
    e.preventDefault()

    let id = localStorage.getItem('propertyId');

    let Name = $('#page-detail #frm-update #name').val();
    let Street = $('#page-detail #frm-update #address').val();
    let City = $('#page-detail #frm-update #city').val();
    let District = $('#page-detail #frm-update #distrit').val();
    let Ward = $('#page-detail #frm-update #ward').val();
    let Type = $('#page-detail #frm-update #type').val();
    let Furniture = $('#page-detail #frm-update #furniture').val();
    let Bedroom = $('#page-detail #frm-update #bedrooms').val();
    let Price = $('#page-detail #frm-update #price').val();
    let Reporter = $('#page-detail #frm-update #reporter').val();

    db.transaction(function (tx) {
        let query = `UPDATE Property
                        SET Name = ?,
                            Street = ?, City = ?, District = ?, Ward = ?,
                            Type = ?, Bedroom = ?, Price = ?, Furniture = ?, Reporter = ?,
                            DateAdded = julianday('now')
                        WHERE Id = ?`;

        tx.executeSql(query, [Name, Street, City, District, Ward, Type, Bedroom, Price, Furniture, Reporter, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update property '${Name}' successfully.`);

            showDetail();
            $('#page-detail #frm-update').popup('close');
        }
    });

}

$(document).on('keyup', $('#page-list #search-property'), filterProperty);
function filterProperty() {
    let searchValue =$('#page-list #search-property').val().toLowerCase();
    let li = $('#page-list #list-account ul li');

    for (let i = 0; i < li.length; i++) {
        let a = li[i].getElementsByTagName("a");
        for(j = 0; j < a.length; j++){
            let aData = a[j];
            let searchText = aData.textContent || aData.innerHTML;
            if(aData){
                if (searchText.toLowerCase().indexOf(searchValue) > -1) {
                   li[i].style.display = "";
                   break;
                }else{
                    li[i].style.display = "none"
                }
            }
        }
    }
}

$(document).on('vclick', '#page-home #btn-beep', beep);
function beep() {
    navigator.notification.beep(4);
}


$(document).on('vclick', '#page-home #btn-vibration', vibration);
function vibration() {
    navigator.vibrate(1000, 1000, 1000, 3000, 3000, 3000, 1000, 1000, 1000);
}
