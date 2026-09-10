'use strict';

var userContacts;

userContacts = Array.from(document.querySelectorAll("#tableBody tr")).map(function (row) {
    var cells = row.getElementsByTagName("td");

    return {
        name: cells[0].textContent.trim(),
        phone: cells[1].textContent.trim(),
        email: cells[2].textContent.trim()
    };
});


var userNameInp = document.getElementById("userName");
var userPhoneInp = document.getElementById("userPhone");
var userEmailInp = document.getElementById("userEmail");

var inps = document.getElementsByTagName("input");

function addContact()
{
    
    if(validateName() == true && validatePhone() == true && validateEmail() == true){
        
    var contacts = { name:userNameInp.value , phone:userPhoneInp.value , email:userEmailInp.value};
    
    userContacts.push(contacts);
    
    displayData();
    
    clearData();

    }
    else
    {
        alert("please fill in the form");
    }
    
    
    
}



function displayData()
{
    var temp = "";
    for(var i=0 ; i<userContacts.length ; i++)
    {
        temp += "<tr><td>"+userContacts[i].name+"</td><td>"+userContacts[i].phone+"</td><td>"+userContacts[i].email+"</td><td>"+'<a onclick="deleteContact(\''+userContacts[i].name+'\')" class="text-danger"><i class="fas fa-minus-circle"></i></a>'+"</td><td>"+'<a href="#" class="text-white"><i class="fas fa-envelope"></i></a>'+"</td></tr>";
    }
    document.getElementById("tableBody").innerHTML = temp;
    
}





function clearData()
{
    for(var i=0; i<inps.length; i++)
    {
        inps[i].value="";
    }
}






function deleteContact(name)
{
    var i=0;
    for(var i=0; i<userContacts.length; i++)
    {
        if(userContacts[i].name == name)
        {
            userContacts.splice(i , 1);
        }
    }
    
    
    displayData();
    
}




function searchFunction() 
{
  var input = document.getElementById("myInput");
  if (!input) {
    return;
  }

  var filter = input.value.trim().toUpperCase();
  var rows = document.querySelectorAll("#tableBody tr");

  Array.prototype.forEach.call(rows, function (row) {
    var contactValues = Array.from(row.querySelectorAll("td"))
      .slice(0, 3)
      .map(function (cell) {
        return (cell.textContent || "").toUpperCase();
      });

    var matches = contactValues.some(function (value) {
      return value.indexOf(filter) > -1;
    });

    row.style.display = matches ? "" : "none";
  });
}

var searchInput = document.getElementById("myInput");
var searchForm = document.getElementById("searchForm");

if (searchInput) {
    searchInput.addEventListener("input", searchFunction);
}

if (searchForm) {
    searchForm.addEventListener("submit", function () {
        searchInput.value = searchInput.value.trim();
    });
}

searchFunction();


function validateName()
{
    var regex = /^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/;
    if(regex.test(userNameInp.value) == true)
    {
        document.getElementById("nameAlert").style.display="none";
        return true;
    }
    else
    {
        document.getElementById("nameAlert").style.display="block";
        return false;
    }
}

function validatePhone()
{
    var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if(regex.test(userPhoneInp.value) == true)
    {
        document.getElementById("phoneAlert").style.display="none";
        return true;
    }
    else
    {
        document.getElementById("phoneAlert").style.display="block";
        return false;
    }
}


function validateEmail()
{
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if(regex.test(userEmailInp.value) == true)
    {
        document.getElementById("mailAlert").style.display="none";
        return true;
    }
    else
    {
        document.getElementById("mailAlert").style.display="block";
        return false;
    }
}
