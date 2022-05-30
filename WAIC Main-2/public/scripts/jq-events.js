$(document).ready(
    function()
    {  
        /*..........It seems the drop happens before the stop
            but it's fine incase bugs come up later on this is easily fixable */

        // Setting the collection container to droppable
        $("#theCollection").droppable(
            {
                drop: function()
                {
                    dropped = true;
                    $(".clicked").draggable("disable");
                    $(".clicked").addClass("collectionItem");
                    $(".clicked").children()[0].classList.remove("unaddedresult-file");
                    $(".clicked").children()[0].classList.add("result-file");
                    $("#theCollection").append($(".clicked"));
                    $(".result-file").unbind();                
                }
            }
        );

        // setting the select all functionality
        $("#select-all").on('click',
            function()
            {
                if(document.getElementById('select-all').checked)
                {
                    $(".filePage").addClass("selected");
                }
                else
                {
                    $(".filePage").removeClass("selected");
                }
            }
        );

        $(".save-collection-btn").click(
            function()
            {
                sessionStorage.setItem("collectionName", $('#heading-input').val());
                var collectionContent = $("#theCollection").children();
                sessionStorage.setItem("numItems", collectionContent.toArray().length);

                for(let i = 1; i < collectionContent.toArray().length; i++)
                {
                    sessionStorage.setItem("collectionItem-"+i, $("#"+collectionContent[i].getAttribute("id")).children()[1].innerHTML);
                }
                location.href = "http://localhost:3000/fileSelectionPrev.html"; 
            }
        );
    }
);
