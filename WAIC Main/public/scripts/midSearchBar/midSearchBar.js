var midSearchbar = $("<div></div>").attr({"id": "search-bar-2"});

midSearchbar.append($("<img>")
                .attr({"src": "./images/search-icon.jpg", "class": "search-image-2"}));

midSearchbar.append($("<input/>")
                    .attr({"type": "text", "name": "searchContextInner", "placeholder": "Search", "id": "search-field-2"}));

midSearchbar.append($("<img>")
                    .attr({"src": "./images/dropdownBtn.png", "class": "dropdownBtn"}));


