//1368px width
// Root container carrying all elements
var rootContainer = $("<div></div>").attr({"id": "root-container", "class": "pageContainer container-fluid"});
$("body").append(rootContainer);

// Top navigation bar
rootContainer.append(navigationBar);

// Page Heading
rootContainer.append($("<h1>Welcome back, User</h1>"));

// Suggested content heading and container
rootContainer.append($("<h2>Suggested</h2>"));
rootContainer.append(suggestedContents);

// Your folders heading and container
rootContainer.append(
    $("<div></div>").attr({"class": "homeDisplayContainers"}).append(
        $("<h2>Your collections</h2>"),
        yourFolders,
        $("<div></div>").append(
            $("<a>See all collections</a>").attr({"href": "library.html", "class": "seeAllLink"})
        )
    )
);

// Your files heading and container
rootContainer.append(
    $("<div></div>").attr({"class": "homeDisplayContainers"}).append(
        $("<h2>Your files</h2>"),
        yourFiles,
        $("<div></div>").append(
            $("<a>See all files</a>").attr({"href": "allFiles.html", "class": "seeAllLink"})
        )
    )
);