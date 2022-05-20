$(document).ready(
    function()
    {
        var PDF_DOC,
            CURRENT_PAGE,
            TOTAL_PAGES,
            _PAGE_RENDERING_IN_PROGRESS = 0;

        // initialize and load the PDF
        async function showPDF(pdf_url)
        {
            // get handle of pdf document
            try
            {    
                PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });    
            }
            catch(error)
            {
                alert(error.message);
            }

            // total pages in pdf
            TOTAL_PAGES = PDF_DOC.numPages;
            $(".filePage").detach();

            for(var i = 0; i < TOTAL_PAGES; i++)
            {
                $("#pagesPreview").append(
                    $("<canvas></canvas>").attr({"id": "page-"+ (i+1), "class": "filePage"}) 
                );
                showPage(document.querySelector("#"+ "page-"+(i+1)), i+1);
            }

            // Selecting the page
            $(".filePage").on('click',
                function()
                {
                    /* if(document.getElementById('select-all').checked)
                    {
                        document.getElementById('select-all').checked = false;
                    } */
                    $(this).toggleClass("selected");
                }
            );
        }

        // load and render specific page of the PDF
        async function showPage(_CANVAS, page_no)
        {
            _PAGE_RENDERING_IN_PROGRESS = 1;
            CURRENT_PAGE = page_no;
                            
            // get handle of page
            try
            {
                var page = await PDF_DOC.getPage(page_no);
            }
            catch(error)
            {
                alert(error.message);
            }

            
            // original width of the pdf page at scale 1
            var pdf_original_width = page.getViewport(1).width;
                        
            // as the canvas is of a fixed width we need to adjust the scale of the viewport where page is rendered
            var scale_required = _CANVAS.width / pdf_original_width;

            // get viewport to render the page at required scale
            var viewport = page.getViewport(scale_required);

            // set canvas height same as viewport height
            _CANVAS.height = viewport.height;

            
            // page is rendered on <canvas> element
            var render_context = {
                canvasContext: _CANVAS.getContext('2d'),
                viewport: viewport
            };
                            
            // render the page contents in the canvas
            try
            {
                await page.render(render_context);
            }
            catch(error)
            {
                alert(error.message);
            }

            _PAGE_RENDERING_IN_PROGRESS = 0;
        }

        document.getElementById('heading-input').value = sessionStorage.getItem("collectionName");
        $("#theCollection").empty();

        for(let j = 1; j < sessionStorage.getItem("numItems"); j++)
        {
            $("#theCollection").append(
                $("<div></div>").attr({"id": sessionStorage.getItem("collectionItem-"+j), "class": "collectionItem"}).append(
                    $("<object></object>").attr(
                        {
                            "data": "http://localhost:3000/files/" + sessionStorage.getItem("collectionItem-"+j),
                            "type": "application/pdf",
                            "class": "result-file"
                        }),
                    $("<div></div>").attr({"class": "result-file-name"}).text(sessionStorage.getItem("collectionItem-"+j))
                )
            );
            
        } 
        
        $(".collectionItem").click(
            function()
            {
                $(".collectionItem").removeClass("selected");
                $(this).addClass("selected");

                showPDF("http://localhost:3000/files/" + $(this).attr("id"));
            }
        );

        
        $(".collectionItem:first").trigger("click");

        
    }
);



        