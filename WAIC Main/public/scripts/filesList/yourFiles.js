var yourFiles = $("<div></div>").attr({"id": "Your-files"})

var yourFilesList = ["CPSC233W22.pdf", "Disciplinary.pdf", "SoTL.pdf", "UnessayRubric.pdf"];

yourFilesList.forEach(
    function(item, index)
    {
        yourFiles.append(
            $("<div></div>").attr({"class": "yourFilesCont"}).append(
                $("<object></object>").attr(
                {
                    "data": "http://localhost:3000/files/" + item, "type": "application/pdf", "class": "the-pdf"
                }).append(
                    $("<a></a>").attr({"href": item})
                ),
        
                $("<div></div>").attr({"class": "slide-name"}).text(item)
            )
        );
    }
);

