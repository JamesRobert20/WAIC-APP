var collectionPreview = $("<div></div>").attr("id", "contentPreviewer");

collectionPreview.append($("<h1>Slideshow</h1>").attr({"class": "previewHeading"}));


 var previewDiv = $("<div></div>").attr({"id": "previewDiv"});

var leftPrevContainer = $("<div></div>").attr({"id": "leftPrev", "class": "prevContainer"})
var rightPrevContainer = $("<div></div>").attr({"id": "rightPrev", "class": "prevContainer"})

leftPrevContainer.append($("<div></div>").attr({"class": "pageView"}));

var thePages = $("<div></div>").attr({"id": "pages"});

var pageArray = ["page-1", "page-2", "page-3", "page-4", "page-5", "page-6", "page-7", "page-8", "page-9"];

//console.log(TOTAL_PAGES);
pageArray.forEach(
    function(item)
    {
        thePages.append(
            $("<canvas></canvas>").attr({"id": item, "class": "filePage"})
        );
    }
);

leftPrevContainer.append(thePages);
leftPrevContainer.append(
    $("<div><a href=\"#\" id=\"filter-link\">Advanced Filtering:</a></div>").attr({"id": "advanced-filtering"}),
    
    $("<div></div>").attr({"id": "select-all-box"}).append(
        $("<input>").attr({"type": "checkbox", "id": "select-all", "name": "select-all"}),
        $("<label>Select All</label>").attr({"for": "select-all", "id": "select-all-label"})
    )
    
);

var selectionContainer = $("<div></div>").attr({"id": "selectionContainer"});

var pageOrdering = $("<div></div>").attr({"id": "pagesOrder"});

var orderArray = ["page-4", "page-2", "page-5"];

orderArray.forEach(
    function(item)
    {
        //pageOrdering.append( $("#page-4") );
        pageOrdering.append( $("<div></div>").attr("class", "filePage-1") );
    }
);

selectionContainer.append(
    $("<h2>Your selection</h2>").attr({"class": "selectionHeading"}),
    $("<div></div>").attr({"id": "orderPreview"}),
    pageOrdering
);

rightPrevContainer.append(selectionContainer)
rightPrevContainer.append($("<button>Save to Collection</button>").attr("class", "save-collection btn btn-lg"));

previewDiv.append(leftPrevContainer, rightPrevContainer);
collectionPreview.append(previewDiv);
