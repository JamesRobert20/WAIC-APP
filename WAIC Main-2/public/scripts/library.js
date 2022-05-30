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
        $("<h1>All Collections</h1>").css({"float": "left", "padding-left": "300px"}).css({"margin-bottom": "15px", "width": "75%", "display": "inline-block"}),

        $("<div></div>").attr({"class": "outerSlide-box"}).append(
            $("<img>").attr({"src": "images/addNew.png", "id": "add-new-btn"}),

            $("<div></div>").attr({"id": "createNewCollection"}).append(
                $("<div>Create new collection</div>").css({"margin-top": "1px", "padding": "5px", "font-size": "large"})
            )  
        )

    ).css({"margin-bottom": "10px", "white-space": "nowrap", "width": "90%"})
);

// Collection All Collections container
centered.append(
    $("<div></div>").attr({"id": "all-collections"})
);


$(document).ready(
    function()
    {
        // Array to hold the list of folders
        let folderArray = ["Calculus 201", "Sex Education", "WAIC", "Harry Potter books", "Powerpoints","Calculus 201", "Sex Education", "WAIC", "Harry Potter books", "Powerpoints"];

        // Loop through and display each folder in array
        folderArray.forEach(
            function(item, index)
            {
                $("#all-collections").append(
                    $("<div></div>").attr({"id": "folder-" + (index+1), "class": "folderCont"}).append(
                        $("<img></img>").attr({"src": "images/folder-icon.png", "class": "folder-icon"}),

                        $("<div></div>").attr({"class": "folder-name"}).text(item)
                    )
                );
            }
        );

        $(".folderCont").on('click',
            function()
            {              
                sessionStorage.setItem("collectionSelected", $(this).children()[1].innerHTML);
                location.href = "http://localhost:3000/viewCollection.html";
            }
        );

        function toggleTheBar()
        {
             $("#createNewCollection").animate({
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
        $(".outerSlide-box").on('mousedown',
            function()
            {
                $(this).off('mouseenter mouseleave');
                $(this).addClass("buttonClicked");
            }
        );
        $(".outerSlide-box").on('mouseup',
            function()
            {
                $(this).removeClass("buttonClicked");
                location.href = "http://localhost:3000/fileSelection.html";
                $(".outerSlide-box").on('mouseenter mouseleave', toggleTheBar);
            }
        );
    }
);