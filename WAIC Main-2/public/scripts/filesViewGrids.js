var fileSelectionGrids = $("<div></div>").attr({"id": "fileSelectionGrids"});

var allFilesGridView = $("<div></div>").attr({"id": "allFilesGridView", "class": "fileSelectionGrids-item"});


var filesListGrid = $("<div></div>").attr({"id": "filesListGrid"});

var filesArray = ["WAIC.pdf", "potter.pdf", "phil.pdf", "percyjack.pdf", "sauvage.mp4", "SoTL.pdf", "loadTest.pdf", "phil.pdf", "percyjack.pdf", "SoTL.pdf", "WAIC.pdf", "potter.pdf", "Disciplinary.pdf"];

// Loop through and display all results
filesArray.forEach(
    function(item, index)
    {
        filesListGrid.append(
            $("<div></div>").attr({"id": "result-" + (index+1), "class": "search-result"}).append(
                $("<canvas></canvas>").attr({"id": "file-"+(index+1), "class": "result-file"}),
                $("<div></div>").attr({"class": "result-file-name"}).text(item)
            )
        );
    }
);

allFilesGridView.append($("<h2>All Files<h2>").attr({"class": "gridHeading"}), midSearchbar, searchTags, filesListGrid);

var filePreviewGrid = $("<div></div>").attr({"id": "filePreviewGrid", "class": "fileSelectionGrids-item"});


fileSelectionGrids.append(allFilesGridView, filePreviewGrid, $("<button>A<br>d<br>d<br><br>t<br>o<br><br>d<br>e<br>c<br>k</button>").attr({"id": "addPagesToDeckbtn", "class": "btn btn-primary"}));



$(document).ready(
    function()
    {
        // initialize and load the PDF
        async function showAllPagesFromPdf(pdf_url)
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

            for(var i = 0; i < TOTAL_PAGES; i++)
            {
                filePreviewGrid.append(
                    $("<div></div>").attr({"id": "pageItem-"+ (i+1), "class": "pageDisplayItem"}).append(
                        $("<canvas></canvas>").attr({"id": "page-"+ (i+1), "class": "filePagePreviewed"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(i+1)
                    )
                     
                );
                showPage(document.querySelector("#"+ "page-"+(i+1)), i+1);
            }

            // Selecting the page
            $(".pageDisplayItem").on('click',
                function()
                {
                    /* if(document.getElementById('select-all').checked)
                    {
                        document.getElementById('select-all').checked = false;
                    } */
                    $(this).toggleClass("pageSelected");
                }
            );
        }

        // initialize and load the PDF
        async function showPDF(pdf_url, fileID)
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
    
            showPage(document.querySelector(fileID), 1);
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

        filesArray.forEach(
            function(item, index)
            {
                if(item.slice(item.indexOf('.'), item.length) === ".mp4")
                {
                    document.getElementById("file-"+(index+1)).outerHTML = "<video id=\"file-" + (index+1) + "\"></video>";
                    
                    $("#file-"+(index+1)).attr({"src": "files/"+item, "class": "result-file"});
                    
                }
                else
                {
                    showPDF("http://localhost:3000/files/" + item, "#file-"+(index+1));
                }
            }
        );

        $(".search-result").on('click',
            function()
            {
                var nameOfFile = $(this).children()[1].innerHTML;
                $("#filePreviewGrid").empty();

                $(this).toggleClass("fileSelected");

                if($(this).hasClass("fileSelected"))
                {
                    $(".search-result").removeClass("fileSelected");
                    $(this).addClass("fileSelected");

                    if(nameOfFile.slice(nameOfFile.indexOf('.'), nameOfFile.length) === ".mp4")
                    {
                        filePreviewGrid.removeClass("fileOnDisplay");
                        filePreviewGrid.addClass("videoOnDisplay");
                        filePreviewGrid.append(
                            $("<video controls>Your browser does not support video preview!</video>").attr({"id": "videoPage", "class": "video-file"}).append(
                                $("<source>").attr({"src":"files/"+ nameOfFile, "type":"video/mp4"})
                            )
                        );
                    }
                    else
                    {
                        filePreviewGrid.removeClass("videoOnDisplay");
                        filePreviewGrid.addClass("fileOnDisplay");
                        showAllPagesFromPdf("http://localhost:3000/files/" + nameOfFile);
                    }                
                    
                }
            }
        );
    }
);