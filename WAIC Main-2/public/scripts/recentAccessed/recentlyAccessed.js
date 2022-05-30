var recents = $("<div></div>").attr({"id": "Your-files", "class": "homeDisplayInnerContainers"});

var yourFilesList = ["CPSC233W22.pdf", "Disciplinary.pdf", "SoTL.pdf", "UnessayRubric.pdf"];

yourFilesList.forEach(
    function(item, index)
    {
        recents.append(
            $("<div></div>").attr({"class": "yourFilesCont"}).append(
                $("<object></object>").attr(
                {
                    "data": "files/" + item, "type": "application/pdf", "class": "the-pdf"
                }).append(
                    $("<a></a>").attr({"href": item})
                ),
        
                $("<div></div>").attr({"class": "slide-name"}).text(item)
            )
        );
    }
);

