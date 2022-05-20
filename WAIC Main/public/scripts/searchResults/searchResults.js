// Container for the search Results
var searchResults = $("<div></div>").attr({"id": "search-results", "class": "searchResults"});

function extra(num)
{
    if(num > 5)
    {
        return "excess";
    }
    else{
        return "";
    }
}

function printData(fileArray)
{
    // Loop through and display all results
    fileArray.forEach(
        function(item, index)
        {
            searchResults.append(
                $("<div></div>").attr({"id": "result-" + (index+1), "class": "search-result"}).append(
                    $("<object></object>").attr(
                        {
                            "data": "http://localhost:3000/files/" + item.file_name, "type": "application/pdf", "class": "unaddedresult-file"
                        }),
                    $("<div></div>").attr({"class": "result-file-name"}).text(item.file_name)
                )
            );
        }
    );

    // Setting the search result containers to draggable
    $(".search-result").draggable( { 
        drag: function()
        {
            $(this).addClass("clicked");
        },
        stop: function()
        {
            $(this).removeClass("clicked");
        },

        helper: "clone" 
    });
}

$.get( "api/files", function(data, status) { printData(data.files); });

// array of search results
//var fileArray = ["potter.pdf", "phil.pdf", "potter.pdf", "WAIC.pdf", "percyjack.pdf", "WAIC.pdf", "potter.pdf", "phil.pdf"];
//console.log(fileArray);


/* $("<div></div>").attr({"id": "result-" + (index+1),"class": "search-result"}).append(
                $("<object></object>").attr(
                    {
                        "data": item, "type": "application/pdf", "class": "unaddedresult-file"
                    }),
                $("<div></div>").attr({"class": "result-file-name"}).text(item)
            ) */

/* $("<iframe></iframe>").attr({ "src": item, "class": "unaddedresult-file" }) */