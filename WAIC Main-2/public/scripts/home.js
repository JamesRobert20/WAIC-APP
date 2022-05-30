//1368px width
// Root container carrying all elements
var rootContainer = $("<div></div>").attr({"id": "root-container", "class": "pageContainer container-fluid"});
$("body").append(rootContainer);

// Page navigation bar
rootContainer.append(navigationBar);
// Page Heading
rootContainer.append($("<h1>Content Manager</h1>").css({"text-align": "center"}));

// Your files heading and container
rootContainer.append(
    $("<div></div>").attr({"class": "homeDisplayContainers"}).append(
        $("<div><h2>Recents</h2></div>").attr("class", "headings").css("margin-top", "0px"),
        recents
    )
); 

// Suggested content heading and container
rootContainer.append(
    $("<div></div>").attr({"class": "homeDisplayContainers"}).append(
        $("<div><h2>Suggested</h2></div>").attr("class", "headings"),
        suggestedContents
    )
);

// Your folders heading and container
rootContainer.append(
    $("<div></div>").attr({"class": "homeDisplayContainers"}).append(
        $("<div><h2>Your collections</h2></div>").attr("class", "headings"),
        yourCollections,
        $("<div></div>").append(
            $("<a>See all collections</a>").attr({"href": "library.html", "class": "seeAllLink"})
        )
    )
);

