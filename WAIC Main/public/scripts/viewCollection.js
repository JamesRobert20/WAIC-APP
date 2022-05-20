//1368px width
// Root container carrying all elements
var rootContainer = $("<div></div>").attr({"id": "root-container", "class": "pageContainer container-fluid"});
$("body").append(rootContainer);

// Top navigation bar
rootContainer.append(navigationBar); 

// Centering the items
var centered = $("<center></center>");
rootContainer.append(centered);

// Page Heading
centered.append(
    $("<div></div>").append(
        $("<h1></h1>").css({"float": "left", "padding-left": "300px"}).css({"margin-bottom": "15px", "width": "75%", "display": "inline-block"}).text(sessionStorage.getItem("collectionSelected")),

        $("<div></div>").attr({"class": "outerSlide-box"}).append(
            $("<img>").attr({"src": "images/addNew.png", "class": "add-new-btn"}),

            $("<div></div>").attr({"class": "addNewFile"}).append(
                $("<div>Add more pages</div>").css({"margin-top": "1px", "padding": "5px", "font-size": "large"})
            )  
        )

    ).css({"margin-bottom": "10px", "white-space": "nowrap", "width": "90%"})
);

// All files container
centered.append(
    $("<div></div>").attr({"id": "all-files"})
);

$(document).ready(
    function()
    {
        // Array to hold the list of folders
        let filesArray = ["WAIC.pdf", "potter.pdf", "phil.pdf", "percyjack.pdf", "SoTL.pdf", "phil.pdf", "percyjack.pdf", "SoTL.pdf", "WAIC.pdf", "potter.pdf", "Disciplinary.pdf"];

        // Loop through and display each folder in array
        filesArray.forEach(
            function(item, index)
            {
                $("#all-files").append(
                    $("<div></div>").attr({"class": "suggestedContent"}).append(
                        $("<object></object>").attr(
                        {
                            "data": "files/" + item, "type": "application/pdf", "class": "file-canvas"
                        }).append(
                            $("<a></a>").attr({"href": item})
                        ),
                
                        $("<div></div>").attr({"class": "slide-name"}).text(item)
                    )
                );
            }
        );

        function toggleTheBar()
        { 
            $(".addNewFile").animate({
                width: "toggle"
            });           
        }

        $(".outerSlide-box").on('mouseenter mouseleave', toggleTheBar);
    }
);
    