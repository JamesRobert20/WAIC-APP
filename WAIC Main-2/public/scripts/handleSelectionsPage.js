$(document).ready(
    function()
    {
        $("#addPagesToDeckbtn").on('click',
        function()
        {
            var selectedPages = $("#filePreviewGrid .pageSelected");

            for(var i = 0; i < selectedPages.length; i++) 
            {
                /* let item = selectedPages[i];
                item.classList.remove("pageSelected");
                let theItem = document.querySelector('#'+item.getAttribute("id"));
                let clonedItem = theItem.cloneNode(true); */
                //document.getElementById("deckContainer").appendChild(clonedItem);

                let item = selectedPages[i];
                item.classList.remove("pageSelected");

                $("#deckContainer").append(
                    $("<div></div>").attr({"class": "wholeSlideContainer"}).append(
                        $("<div></div>").attr({"class": "pageDisplayItem deckItem deckLowerItem"}).append(
                            $("<img>").attr({"src": item.firstChild.toDataURL(), "class": "filePagePreviewed"}),
                            $("<div></div>").attr({"class": "pageNumber"}).text(item.lastChild.innerHTML)
                        ),
                        $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                            $("<div></div>").attr({"class": "cancelBtn"}).append(
                                $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                            )
                        )
                    )
                    
                );
            }
            $(".cancelBtn").on('click',
                function()
                {
                    $(this).parent().parent().detach();
                }
            );
        });

        
    }
);
