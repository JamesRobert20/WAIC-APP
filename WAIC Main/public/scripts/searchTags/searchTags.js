// search tags container 
var searchTags = $("<div></div>").attr({"id": "search-tags-container"});

var counter = 1;
function tagName()
{
        if(counter == 1) { counter++; return "Location"; }
        else if(counter == 2) { counter++; return "File Type"; }
        else if(counter == 3) { counter++; return "Last Mod"; }
        else { return "Title"; }
}

// List of tag objects
var locationTag = {
    name: "location-tag",
    options: []
};
var fileTypeTag = {
    name: "fileType-tag",
    options: ["pdf(.pdf)", "powerpoint(.pptx)", "word(.docx)", "text file(.txt)"]
};
var lastModTag = {
    name: "lastMod-tag",
    options: []
};
var titleTag = {
    name: "title-tag",
    options: []
};

var tags = [locationTag, fileTypeTag, lastModTag, titleTag];
tags.forEach(
    function (item)
    {
        var selectOpt = $("<select></select>").attr({"id": item.name, "class": "search-tags"})
        selectOpt.append(
            $("<option selected value></option>").attr({"class": "tag-names"}).text(tagName)
        );
        
        item.options.forEach(
            function(theItem)
            {
                selectOpt.append(
                    $("<option></option>").attr({"class": "tag-names"}).text(theItem)
                )
            }
        );       
        searchTags.append(selectOpt);
    }
);
/* $("<div></div>").append(
                $("<div></div>").attr({"id": item, "class": "search-tags"}).append(
                    $("<img>").attr({"src": "./images/dropdownBtn.png", "class": "dropdowns"}), 
                    $("<div></div>").attr({"class": "tag-names"}).text(tagName)
                )
            ).attr({"id": item + "-container"}) */