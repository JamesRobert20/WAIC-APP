var collectionForm = $("<div></div>");



var newCollectionHeader = $("<div></div>").attr({"class": "collectionName"});
newCollectionHeader.append(
    $("<div></div>").attr("class", "leftarrow").text("<"),

    $("<input />").attr({"id": "heading-input", "type": "text", "name": "collectionName", "placeholder": "new collection name"})
                .css({
                    "background-color": "aliceblue",
                    "outline": "none",
                    "border": "none",
                    "height": "90%",
                    "width": "311px",
                    "font-size": "34px",
                    "font-style": "italic",
                    "text-align": "center",
                    "margin-top": "2.7px"
                }),
    
    $("<div></div>").attr("class", "rightarrow").text(">")
);

var newCollection = $("<div></div>").attr({"id": "theCollection"});

newCollection.append(
    $("<div>Drop files here</div>").attr({"id": "drop-directer","class": "collectionItem"})
                                    .css({
                                            "background-color": "grey",
                                            "border-radius": "10px",
                                            "padding-top": "30px"
                                        })
);


collectionForm.append(newCollectionHeader);
collectionForm.append(newCollection);

// Save collection button
collectionForm.append(
    $("<div></div>").css(
        {
            "width": "870",
            "display": "flex",
            "flex-direction": "row-reverse"

    }).append(
        $("<button>Save Collection</button>").attr({ "class": "save-collection-btn btn btn-lg"})
    )
);

collectionForm.css({
    "margin-top": "40px",
    "width": "900px",
    "min-height": "400px",
    "border-radius": "10px",
    "border": "2px solid grey"
});