var collectionForm = $("<div></div>").attr({"id": "collection-tags-Parent"});

var packageHeading = $("<h2>My New Slides Deck</h2>").attr({"id": "deckName", "class": "deckGridHeadings"}); 

var tagsHeading = $("<h2>Add Tags</h2>").attr({"class": "deckGridHeadings"}); 

var packageContainer = $("<div></div>").attr({"id": "deckContainer", "class": "deckGridContainers"}); 

var tagsContainer = $("<div></div>").attr({"id": "tagsContainer", "class": "deckGridContainers"});

tagsContainer.append($("<input>").attr({"id": "tagInput", "placeholder": "Type a tag name to add"}));

collectionForm.append(packageHeading, tagsHeading, packageContainer, tagsContainer);