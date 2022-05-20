// Initializing a container for all content in the body
$("body").append($("<div></div>").attr("id", "my-dom-content"));
let bodyContent = $("#my-dom-content");

// Top navigation bar of the page
bodyContent.append($("<nav></nav>").attr({ "id": "top-links", "class": "navbar navbar-expand-md" })); 

    // Adding contents of the navigation bar
$("nav#top-links").append($("<ul></ul>").attr("class", "navbar-nav"));

$("nav ul").append($("<li></li>"));

// Could not assign to variable because append uses the reference
// Cannot append multiple same object
$("nav ul li").append(
    $("<a></a>").attr({ "class": "nav-link largeBold", "href": "#" }), 
    $("<a></a>").attr({ "class": "nav-link largeBold", "href": "#" }), 
    $("<a></a>").attr({ "class": "nav-link largeBold", "href": "#" })
);

$("a.nav-link").text( (counter) =>
    {
        if(counter === 0) 
        {
            counter++;
            return "Create new library";
        }
        else if(counter === 1)
        {
            counter++;
            return "Your Library";
        }
        else
        {
            return "Search";
        }
    });

// minimising some spacing
$("a:contains('Create\ new')").css("padding-right", "60px");

// Heading of the Page
bodyContent.append($("<h3></h3>").css("text-align","center").text("Welcome to your content viewer"));

// Grid Layout of the page
bodyContent.append($("<div></div>").attr({"class": "container-fluid", "id": "page-grid"}).css("height","600"));
let pageLayout = $("#page-grid");

pageLayout.append($("<div></div>").attr({"id": "page-left", "class": "page-rightBox page-partContent"}));
pageLayout.append($("<div></div>").attr({"id": "page-right", "class": "page-rightBox"}));

$("#page-left").append($("<div></div>").text("Recently Uploaded").attr("class", "largeBold").css("text-align", "center"));
$("#page-left").append($("<div></div>").css("height","88%"));

$("#page-right").append($("<div></div>").attr({"id": "prevbtn-container"}));
$("#prevbtn-container").append($("<img></img>")
                        .attr({"class": "np-button", "src": "images/prvBtn2.png"}));


$("#page-right").append($("<div></div>").attr({"id": "right-display", "class": "page-partContent"}));

$("#right-display").append($("<div></div>").text("Your Library").attr("class", "largeBold").css("text-align", "center"));


$("#page-right").append($("<div></div>").attr({"id": "nextbtn-container"}));
$("#nextbtn-container").append($("<img></img>")
                        .attr({"class": "np-button", "src": "images/nxtBtn2.png"}));


var contentToView;

var contentList1 = $("<div></div>").attr("id","contentList1").css("height","88%");

contentList1.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/calcSlides.png"}));

contentList1.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/cpSlides.png"}));

contentList1.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/eduSlides.png"}));

contentList1.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/geoSlides.png"}));


var contentList2 = $("<div></div>").attr({"id": "contentList2"}).css("height","88%");
contentList2.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/geoSlides.png"}));

contentList2.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/eduSlides.png"}));

contentList2.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/cpSlides.png"}));

contentList2.append($("<img></img>")
.attr({"class": "content-list-item", "src": "images/calcSlides.png"}));



contentToView = contentList1;
$("#right-display").append(contentToView);


