$("#nextbtn-container").click(
    function()
    {
        contentToView.css("position", "relative");
        contentToView.animate(
            {
                left: "-60px",
                opacity: "0"
        },"slow");
        setTimeout( function() {
            
            if(contentToView === contentList1)
            {
                contentToView.remove();
                contentToView = contentList2;
            }
            else
            {
                contentToView.remove();
                contentToView = contentList1;
            }
            
            contentToView.css({"position": "relative", "opacity": "0"});
            $("#right-display").append(contentToView);

            contentToView.animate({ left: "60px"},"fast");
            contentToView.animate({ left: "-=60px", opacity: "1"},"slow")
        }, 500);
        
        contentToView.css("left","0px");
        //$("#nextbtn-container").hide();
    }
);