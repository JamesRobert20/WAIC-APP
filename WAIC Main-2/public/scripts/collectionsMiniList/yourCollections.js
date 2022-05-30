// The Folders container
var yourCollections = $("<div></div>").attr({"id": "Your-folders", "class": "homeDisplayInnerContainers"});

// Array to hold the list of folders
var folderArray = ["Calculus 201", "Sex Education", "WAIC", "Harry Potter books"];

// Loop through and display each folder in array
folderArray.forEach(
    function(item, index)
    {
        yourCollections.append(
            $("<div></div>").attr({"id": "folder-" + (index+1), "class": "folderCont"}).append(
                $("<img></img>").attr({"src": "./images/folder-icon.png", "class": "folder-icon"}),

                $("<div></div>").attr({"class": "folder-name"}).text(item)
            )
        );
    }
);

$(document).ready(
    function()
    {
        $(".folderCont").on('click',
            function()
            {              
                sessionStorage.setItem("collectionSelected", $(this).children()[1].innerHTML);
                location.href = "http://localhost:3000/viewCollection.html";
            }
        );
    }
);

