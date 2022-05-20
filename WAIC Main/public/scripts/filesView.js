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
        $("<h1>All Files</h1>").css({"float": "left", "padding-left": "300px"}).css({"margin-bottom": "15px", "width": "75%", "display": "inline-block"}),

        $("<div></div>").attr({"class": "outerSlide-box"}).append(
            $("<img>").attr({"src": "images/addNew.png", "id": "add-new-btn"}),

            $("<div></div>").attr({"id": "createNewFile"}).append(
                $("<div>Add new file</div>").css({"margin-top": "1px", "padding": "5px", "font-size": "large"})
            )  
        )

    ).css({"margin-bottom": "10px", "white-space": "nowrap", "width": "90%"})
);

// Collection All Collections container
centered.append(
    $("<div></div>").attr({"id": "all-files"})
);


$(document).ready(
    function()
    {
        // Array to hold the list of folders
        let filesArray = ["CPSC233W22.pdf", "Disciplinary.pdf", "percyjack.pdf", "phil.pdf", "potter.pdf","SoTL.pdf", "UnessayRubric.pdf", "WAIC.pdf", "potter.pdf", "phil.pdf"];

        // Loop through and display each folder in array
        filesArray.forEach(
            function(item, index)
            {
                $("#all-files").append(
                    $("<div></div>").attr({"class": "fileContent"}).append(
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
             $("#createNewFile").animate({
                width: "toggle"
            });            
        }

        // My attempts to fix the mouse enter and mouse leave spamming using timers
        function toggleTheBarTimed()
        {
            let first = $(".outerSlide-box:hover").length;
            setTimeout(
                function()
                {
                    let second = $(".outerSlide-box:hover").length;
                    if(first === second)
                    {
                        $("#createNewCollection").animate({
                            width: "toggle"
                        });
                    }
                }, 2000)            
        }

        function toggleTheBarTimed2()
        {
            setTimeout(
                function()
                {
                    if($(".outerSlide-box:hover").length == 0)
                    {
                        $("#createNewCollection").animate({
                            width: "toggle"
                        });
                    }
                }, 2000)            
        }

        /* let observer = new MutationObserver(toggleTheBar);

        observer.observe(document.querySelector('#add-new-btn'), { attributes: true, attributeFilter: ['opacity'] }); */
        
        //$(".outerSlide-box").on('mouseleave', toggleTheBar);

        $(".outerSlide-box").on('mouseenter mouseleave', toggleTheBar);
    }
);