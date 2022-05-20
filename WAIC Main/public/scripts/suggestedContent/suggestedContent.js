var suggestedContents = $("<div></div>").attr({"id": "suggested-contents"});

var suggestedContentList = ["WAIC.pdf", "potter.pdf", "phil.pdf", "percyjack.pdf"];

var counter = 0;
function namer()
{
    if (counter == 0) { counter++; return "Design"; } 
    else if(counter == 1) { counter++; return "Harry Potter"; }
    else if(counter == 2) { counter++; return "Philosophy"; }
    else{ return "Percy jackson"; }   
}

suggestedContentList.forEach(
    function(item, index)
    {
        suggestedContents.append(
            $("<div></div>").attr({"class": "suggestedContent"}).append(
                $("<object></object>").attr(
                {
                    "data": "http://localhost:3000/files/" + item, "type": "application/pdf", "class": "the-pdf"
                }).append(
                    $("<a></a>").attr({"href": item})
                ),
        
                $("<div></div>").attr({"class": "slide-name"}).text(namer)
            )
        );
    }
);

