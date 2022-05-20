// Top navigation bar
var navigationBar = $("<nav></nav>").attr({ "id": "top-navbar", "class": "navbar navbar-expand-md" })

// ul container for left side of navigation bar 
var leftNavItems = $("<ul></ul>").attr({"id": "left-nav-items", "class": " navbar-nav"});
// Top left icon
leftNavItems.append(
    $("<li></li>").attr("id", "left-img-item").append(
        $("<img>").attr({"src": "./images/top-icon1.png", "class": "left-icon-img"})
    )
);
// Search bar
leftNavItems.append(
    $("<li></li>").attr("id", "search-item").append(
        $("<div></div>").attr({"id": "search-bar-1"}).append(
            $("<img>").attr({"src": "./images/search-icon.jpg", "class": "search-image"}),
            $("<input/>").attr({"type": "text", "name": "searchContext", "placeholder": "Search", "id": "search-field-1"})
        )               
    )
);
navigationBar.append(leftNavItems);

// ul container for right side of navigation bar
var rightNavItems = $("<ul></ul>").attr({"id": "right-nav-items", "class": "navbar-nav"})
// Account view link
rightNavItems.append(
    $("<li></li>").attr("id", "right-link-item").css({"padding": "14px 5px 0px 0px"}).append(
        $("<a> Your account</a>").attr({"href": "#"}).css({"color": "white"})
    )
);
// Top right icon
rightNavItems.append(
    $("<li></li>").attr("id", "right-img-item").append(
        $("<div></div>").attr("class", "account-icon-div").append(
            $("<img></img>").attr({"src": "./images/account-img.png", "class": "account-icon-img"})
        )
    )
);       
navigationBar.append(rightNavItems);