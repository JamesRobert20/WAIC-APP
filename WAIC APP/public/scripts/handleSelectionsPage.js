function mainThread(originalArray, filesArray, fileMasker)
{
    var filePromises = [];
    var PDF_DOC, TOTAL_PAGES, matcher;
    var firstTimeGalleryView = true;
    var scrollAmount;
   
    var fileMasker_1 = {};

    //var filesArray = { "WAIC.pdf":[], "potter.pdf":[], "phil.pdf":[], "percyjack.pdf":[], "sauvage.mp4":[], "SoTL.pdf":[], "loadTest.pdf":[], "phil.pdf":[], "percyjack.pdf":[], "SoTL.pdf":[], "WAIC.pdf":[], "potter.pdf":[], "Disciplinary.pdf":[] };

    $("body").append(
        $("<div></div>").attr({"id": "cover-pages-container"})
    );

    // Loop through and display all results
    for(var index = 0; index < Object.keys(filesArray).length; index++)
    {
        item = fileMasker["mask_"+index];
        var itemNameSplit = item.split(".");
        var theExtension = itemNameSplit[itemNameSplit.length - 1];

        $("#filesListGrid").append(
            $("<div></div>").attr({"id": "result-" + (index+1), "class": "search-result"}).append(
                $("<div></div>").attr({"id": "file-"+(index+1), "class": "result-file"}),
                $("<div></div>").attr({"class": "result-file-name"}).text(item.substring(0,item.indexOf(theExtension)-1))
            )
        );

        if( theExtension == "pdf")
        {
            $("#cover-pages-container").append(
                $("<canvas></canvas>").attr({"id": "cover-page-"+(index+1), "class": "mask_"+index, "width": "420"}).css("display","none")
            );
            displayFiles(item, index, item.substring(0, item.indexOf(theExtension) - 1), theExtension, "#cover-page-"+(index+1));
        }
        else
        {
            displayFiles(item, index, item.substring(0, item.indexOf(theExtension) - 1), theExtension, "#file-"+(index+1));
        }
    }


    Promise.all(filePromises).then(
        function()
        {
            var chldrn = $("#cover-pages-container").children();
            for(var jk = 0; jk < chldrn.length; jk++) 
            {     
                var fileID = "#file-"+chldrn[jk].getAttribute("id").split('-')[chldrn[jk].getAttribute("id").split('-').length - 1];
                
                var coverPage = $(fileID);
                coverPage[0].outerHTML = "<img id=\""+ fileID.substring(1) + "\" class=\"result-file\" >";

                $(fileID).attr("src", chldrn[jk].toDataURL("image/png"));
                
                var masker = chldrn[jk].getAttribute("class");

                filesArray[masker].push(chldrn[jk].toDataURL("image/png"));
            }
            $("#cover-pages-container").remove();
            doneLoading();
        }
    ).catch(
        function(e)
        {
            console.log(e.message + " sumn bad happened");
            doneLoading();
        }
    );

    $(".search-result").on('click', fileClick);

    /* ... Function that initiates loading ... */
    function setLoading()
    {
        $("#root-container").addClass("loading-opacity");
        $("#load-wrapper").show();
    }

    /* ... Function that completes loading ... */
    function doneLoading()
    {
        $("#load-wrapper").fadeOut("slow");
        $("#root-container").removeClass("loading-opacity");
    }

    /* ... Function that handles when undo is pressed in a workspace ... */
    function workspaceUndo()
    {
        var theWorkspaceDisplay = $(this).parent().parent().parent();
        if(theWorkspaceDisplay.hasClass("theReceiver"))
            $(".theGiver").prev().find(".undo-button").addClass("inactive");
        else if(theWorkspaceDisplay.hasClass("theGiver"))
            if((wpActions[$(".theReceiver").parent().attr("id")] != null) && wpActions[$(".theReceiver").parent().attr("id")].undoFrom == "sorting-external")
                if(wpActions[$(".theReceiver").parent().attr("id")].fromCancel == false)
                    $(".theReceiver").prev().find(".undo-button").addClass("inactive");

        theWorkspaceDisplay.find(".temporarily-hidden").addClass("permanently-hidden");
        theWorkspaceDisplay.find(".permanently-hidden").removeClass("temporarily-hidden");

        itemsToUndo_2.undoFrom = "cancel";

        if(itemsToUndo_3[theWorkspaceDisplay.parent().attr("id")] != null)
            itemsToUndo_3[theWorkspaceDisplay.parent().attr("id")].undoFrom = "";

        if(theWorkspaceDisplay.parent().attr("id") != "single-mode")
            wpActions[theWorkspaceDisplay.parent().attr("id")] = { items: [], undoFrom: "", fromCancel: true};
        $(this).parent().parent().addClass("temporarily-hidden");
        theWorkspaceDisplay.prev().find(".undo-button, .save-deck").removeClass("inactive");
    }

    /* ... Function that handles the page clicking event, It highlights the page clicked ... */
    function pageClick()
    {
        var thisPage = $(this);

        thisPage.toggleClass("pageSelected");
        var idNum = thisPage.attr("id").split('-')[1];

        if(thisPage.hasClass("pageSelected"))
            $("#page_"+idNum).parent().next().children()[0].checked = true;
        else
            $("#page_"+idNum).parent().next().children()[0].checked = false;

        if(document.getElementById('select-all-pages').checked)
            document.getElementById('select-all-pages').checked = false;

        else if($("#filePreviewGrid .pageDisplayItem").length == $(".pageSelected").length)
            document.getElementById('select-all-pages').checked = true;
        
    }

    /* ... ... */
    function galleryPageClick()
    {
        var thisPage = $(this);

        $(".galleryPageSelected").removeClass("galleryPageSelected");
        thisPage.toggleClass("galleryPageSelected");

        if((window.getComputedStyle($("#prevbtn-container")[0]).display == window.getComputedStyle($("#nextbtn-container")[0]).display) && (window.getComputedStyle($("#prevbtn-container")[0]).display == "none"))
            $("#prevbtn-container, #nextbtn-container").show();

        
        $("#PagePreviewContainer").empty();
        $("#PagePreviewContainer").append(
            $("<img>").attr({"src": thisPage.find(".PagePreviewed").attr("src"), "class": "singlePage "+thisPage.children(":first").attr("id")})
        );

        if($("#page_" +(parseInt(thisPage.find(".PagePreviewed").attr("id").split('_')[1]) - 1)).length == 0)
            $("#prevbtn-container").hide();
        else
            $("#prevbtn-container").show();

        if($("#page_" +(parseInt(thisPage.find(".PagePreviewed").attr("id").split('_')[1]) + 1)).length == 0)
            $("#nextbtn-container").hide();
        else
            $("#nextbtn-container").show();
    }

    /* ... Function that displays the pages from the array of image-data passed ... */
    function displayPagesFromData(file_name, pagesArray)
    {
        var theMask = Object.keys(fileMasker).find(key => fileMasker[key] === file_name);
        pagesArray.forEach(
            function(item, index)
            {
                $("#filePreviewGrid").append(
                    $("<div></div>").attr({"id": theMask+"-"+ (index+1), "class": "pageDisplayItem"}).append(
                        $("<img>").attr({"src": item, "id": "page-"+ (index+1), "class": "filePagePreviewed"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(index+1)
                    )    
                );
                $("#PagesListContainer").append(
                    $("<div></div>").attr({"class": "wholeGPageContainer"}).append(
                        $("<div></div>").attr({"id": theMask+"-"+ (index+1), "class": "pageDisplayItem-1"}).append(
                            $("<img>").attr({"src": item, "id": "page_"+ (index+1), "class": "PagePreviewed"}),
                            $("<div></div>").attr({"class": "pageNumber-1"}).text(index+1)
                        ),
                        $("<div></div>").attr({"class": "tickPageContainer"}).append(
                            $("<input>").attr({"type": "checkbox", "class": "tickPage"})
                        )  
                    )    
                );
            }
        );

        $(".tickPage").unbind('click').bind('click',
            function()
            { 
                var idNum = $(this).parent().prev().find(".PagePreviewed").attr("id").split("_")[1];
                $("#page-"+idNum).parent().trigger('click');
            }
        );

        // Selecting the page
        $("#filePreviewGrid .pageDisplayItem").on('click', pageClick);

        // Selecting the page from gallery view
        $(".pageDisplayItem-1").on('click', galleryPageClick);

        if(document.getElementById("gallery-view").checked)
        {
            $("#gallery-view").trigger('click');
            document.getElementById("gallery-view").checked = true;
        }
    }

    var pagesOffsets = {};

    /* ... Function that handles the file click event, It highlights the file clicked ... */
    function fileClick()
    {
        var thisFile = $(this);
        firstTimeGalleryView = true;
        pagesOffsets = {};
        $("#PagesListContainer")[0].scrollLeft = 0;
        // Clear the viewer Grid
        $("#filePreviewGrid, #PagePreviewContainer, #PagesListContainer").empty();

        $("#select-all-pages, #select-all-pages-label, #list-view, #list-view-label, #gallery-view, #gallery-view-label").hide();
        $("#prevbtn-container, #nextbtn-container").hide();
        $("#select-multiple, .numberRanges-labels, .numberRanges").hide();
        thisFile.toggleClass("fileSelected");

        if(thisFile.hasClass("fileSelected"))
        {
            var nameOfFile = fileMasker["mask_"+(parseInt(thisFile.attr("id").split('-')[1]) - 1)];
            //nameOfFile = nameOfFile.replace("&amp;","&");

            var fileExtension = nameOfFile.slice(nameOfFile.indexOf('.'), nameOfFile.length);

            // remove selected from all other file items, to leave "this" as the only one selected
            $(".search-result").removeClass("fileSelected");
            thisFile.addClass("fileSelected");

            var masker = Object.keys(fileMasker).find(key => fileMasker[key] === nameOfFile);

            if(fileExtension === ".mp4")
            {
                if(document.getElementById("gallery-view").checked)
                    $("#list-view").trigger('click');

                $("#filePreviewGrid").removeClass("fileOnDisplay");
                $("#filePreviewGrid").removeClass("imageOnDisplay");
                $("#filePreviewGrid").addClass("videoOnDisplay");
                $("#filePreviewGrid").append(
                    $("<video controls>Your browser does not support video preview!</video>").attr({"id": masker, "class": "video-file"}).append(
                        $("<source>").attr({"src":"files/"+ nameOfFile, "type":"video/mp4"})
                    )
                );
            }
            else if(fileExtension == ".png" || fileExtension == ".jpg")
            {
                if(document.getElementById("gallery-view").checked)
                    $("#list-view").trigger('click');
                    
                $("#filePreviewGrid").removeClass("videoOnDisplay");
                $("#filePreviewGrid").removeClass("fileOnDisplay");
                $("#filePreviewGrid").addClass("imageOnDisplay");
            }
            else
            {
                document.getElementById("select-all-pages").checked = false;
                
                $("#select-all-pages, #select-all-pages-label, #list-view, #list-view-label, #gallery-view, #gallery-view-label").show();
                $("#select-multiple, .numberRanges-labels, .numberRanges").show();
                setLoading();                    
                $("#filePreviewGrid").removeClass("videoOnDisplay");
                $("#filePreviewGrid").removeClass("imageOnDisplay");
                $("#filePreviewGrid").addClass("fileOnDisplay");

                if(filesArray[masker].length < 2)
                {
                    showAllPagesFromPdf("files/" + nameOfFile, nameOfFile);
                }
                else
                {
                    displayPagesFromData(nameOfFile, filesArray[masker]);
                    doneLoading();
                }
            }                
        }  
    }

    /* ... Function that displays the first page of file as the file's cover page ... */
    function displayFiles(item, index, filename, itsExtension, idToRender)
    {
        if(itsExtension == "mp4")
        {
            document.getElementById("file-"+(index+1)).outerHTML = "<video id=\"file-" + (index+1) + "\"></video>";
            
            $("#file-"+(index+1)).attr({"src": "files/"+item, "class": "result-file"});
            
        }
        // Need to figure out how to display ppt, maybe just convert ppt to pdf on back-end
        else if( itsExtension == "pptx")
        {
            
        }
        else
        {
            var masker = Object.keys(fileMasker).find(key => fileMasker[key] === item);
            filePromises.push(showPDF("files/" + item, idToRender, filename, filesArray[masker].length > 0));   
        }
    }

    /* ... Async function that gets the pdf document and loops to render all pages from file ... */
    async function showAllPagesFromPdf(pdf_url, file_name)
    {
        // get handle of pdf document
        try
        {    
            PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });    
        }
        catch(error)
        {
            //alert(error.message);
            doneLoading();
        }

        // total pages in pdf
        TOTAL_PAGES = PDF_DOC.numPages;

        var pagePromises = [];

        for(let i = 0; i < TOTAL_PAGES; i++)
        {
            $("body").append(
                $("<canvas></canvas>").attr({"id": "canvasToRemove-"+i, "class": "canvases-to-remove", "width": "580"}).css("display", "none")
            );
            pagePromises.push(showPage(document.querySelector("#canvasToRemove-"+i), i+1));
        }

        Promise.all(pagePromises).then(
            function()
            {
                var masker = Object.keys(fileMasker).find(key => fileMasker[key] === file_name);
                filesArray[masker] = [];
                for(let kh = 0; kh < TOTAL_PAGES; kh++)
                {
                    filesArray[masker].push(document.getElementById("canvasToRemove-"+kh).toDataURL("image/png"));

                    $("#filePreviewGrid").append(
                        $("<div></div>").attr({"id": masker+"-"+ (kh+1), "class": "pageDisplayItem"}).append(
                            $("<img>").attr({"src": document.getElementById("canvasToRemove-"+kh).toDataURL("image/png"), "id": "page-"+ (kh+1), "class": "filePagePreviewed"}),
                            $("<div></div>").attr({"class": "pageNumber"}).text(kh+1)
                        )    
                    );
                    $("#PagesListContainer").append(
                        $("<div></div>").attr({"class": "wholeGPageContainer"}).append(
                            $("<div></div>").attr({"id": masker+";"+ (kh+1), "class": "pageDisplayItem-1"}).append(
                                $("<img>").attr({"src": document.getElementById("canvasToRemove-"+kh).toDataURL("image/png"), "id": "page_"+ (kh+1), "class": "PagePreviewed"}),
                                $("<div></div>").attr({"class": "pageNumber-1"}).text(kh+1)
                            ),
                            $("<div></div>").attr({"class": "tickPageContainer"}).append(
                                $("<input>").attr({"type": "checkbox", "class": "tickPage"})
                            )  
                        )  
                    );
                    $("#canvasToRemove-"+kh).remove();
                }

                $(".tickPage").unbind('click').bind('click',
                    function()
                    { 
                        var idNum = $(this).parent().prev().find(".PagePreviewed").attr("id").split("_")[1];
                        $("#page-"+idNum).parent().trigger('click');
                    }
                );

                // Selecting the page
                $("#filePreviewGrid .pageDisplayItem").on('click', pageClick);
                
                // Selecting the page from gallery view
                $(".pageDisplayItem-1").on('click', galleryPageClick);

                if(document.getElementById("gallery-view").checked)
                {
                    $("#gallery-view").trigger('click');
                    document.getElementById("gallery-view").checked = true;
                }
                
                doneLoading();
            }
        ).catch(doneLoading);
    }

    /* ... Async function that displays the first page as the cover page for the file ... */
    async function showPDF(pdf_url, fileID, fileName, hasImage)
    {
        if(hasImage)
        {
            var masker = Object.keys(fileMasker).find(key => fileMasker[key] === fileName+".pdf");
            $(fileID).attr("src", filesArray[masker][0]);
        }
        else
        {
            // get handle of pdf document
            try
            {    
                PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });
                //pdf_documents.push(PDF_DOC);    
            }
            catch(error)
            {
                alert(error.message);
            }
            
            return showPage(document.querySelector(fileID), 1);
        }
    }

    /* ... Async function that renders the page number given on the canvas passed ... */
    async function showPage(_CANVAS, page_no)
    {                    
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
            var renderPromise = await page.render(render_context);
        }
        catch(error)
        {
            alert(error.message);
        }

        return renderPromise;
    }


    /* ... Function that returns a boolean stating whether the last modified date matches ... */
    function matchLastModTag(fileNameGiven)
    {
        var LastModValue = $("#lastMod-tag").val();

        if(LastModValue == "Last Modified")
        {
            return true;
        }
        else
        {
            var theCondition = false;

            originalArray.forEach(
                function(item)
                {
                    if(item.file_name == fileNameGiven)
                    {
                        var today = new Date();
                        todayDate = today.getDate();
                        todayMonth = today.getMonth() + 1;
                        todayYear = today.getFullYear();

                        var lastModObject = item.last_modified;

                        if(LastModValue == "within the last day")
                        {
                            var previous = new Date();
                            previous.setDate(todayDate - 1);
                            
                            if(lastModObject.date == todayDate)
                                theCondition = (lastModObject.month == todayMonth) && (lastModObject.year == todayYear);

                            else if(lastModObject.date == previous.getDate())
                                theCondition = (lastModObject.month == previous.getMonth() + 1) && (lastModObject.year == previous.getFullYear());
                        }
                        else if(LastModValue == "within the last week")
                        {
                            var previous = new Date();
                            previous.setDate(todayDate - 7);

                            if(lastModObject.month == previous.getMonth()+ 1)
                                theCondition = (lastModObject.date >=  previous.getDate()) && (lastModObject.year == previous.getFullYear());
                            
                            else if (lastModObject.month == todayMonth)
                                theCondition = (lastModObject.date <=  todayDate) && (lastModObject.year == previous.getFullYear());

                        }
                        else if(LastModValue == "within the last month")                      
                        {
                            var previous = new Date();
                            previous.setMonth(todayMonth - 2);
                            
                            if(lastModObject.month == previous.getMonth()+ 1)
                                theCondition = (lastModObject.date >=  previous.getDate()) && (lastModObject.year == previous.getFullYear());
                            
                            else if (lastModObject.month == todayMonth)
                                theCondition = (lastModObject.date <=  todayDate) && (lastModObject.year == previous.getFullYear());
                            
                        }
                        
                        else if(LastModValue == "within the last 6 months")
                        {
                            var previous = new Date();
                            previous.setMonth(todayMonth - 7);
                            
                            if(previous.getFullYear() == todayYear - 1)
                            {
                                if(lastModObject.year == previous.getFullYear())
                                {
                                    if(lastModObject.month > previous.getMonth() + 1)
                                        theCondition = true;
                                    else if(lastModObject.month == previous.getMonth() + 1)
                                        theCondition = lastModObject.date >=  previous.getDate();
                                }
                                else if(lastModObject.year == todayYear)
                                {
                                    if(lastModObject.month < todayMonth)
                                        theCondition = true;
                                    else if(lastModObject.month == todayMonth)
                                        theCondition = lastModObject.date <=  previous.getDate();
                                }
                            }
                            else
                            {
                                if((lastModObject.month > previous.getMonth() + 1) && lastModObject.month < todayMonth)
                                    theCondition = true;
                                
                                else if(lastModObject.month == previous.getMonth() + 1)
                                    theCondition = (lastModObject.date >=  previous.getDate());
                                
                                else if(lastModObject.month == todayMonth)
                                    theCondition = (lastModObject.date <=  todayDate);
                            }
                        }

                        else
                        {
                            var previous = new Date();
                            previous.setFullYear(todayYear - 1);
                            
                            if(lastModObject.year == previous.getFullYear())
                            {
                                if(lastModObject.month > previous.getMonth() + 1)
                                    theCondition = true;
                                else if(lastModObject.month == previous.getMonth() + 1)
                                    theCondition = lastModObject.date >=  previous.getDate();
                            }
                            else if(lastModObject.year == todayYear)
                            {
                                if(lastModObject.month < todayMonth)
                                    theCondition = true;
                                else if(lastModObject.month == todayMonth)
                                    theCondition = lastModObject.date <=  previous.getDate();
                            }
                        }

                        return
                    }
                }
            );
            return theCondition;
        }
    }

    /* ... Function that returns a boolean stating whether the extensions matches ... */
    function matchFileTypeTag(extension)
    {
        var fileTagValue = $("#fileType-tag").val();

        if(fileTagValue == "File Type")
        {
            return true;
        }
        else
        {
            var extFromTag = fileTagValue.substring(fileTagValue.indexOf("(")+2).replace(")", "");

            if(fileTagValue.includes("jpg/png"))
                return extFromTag.split("/")[0] == extension || extFromTag.split("/")[1] == extension;
            else
                return extFromTag == extension;
        }
    }

    /* ... Function that returns a boolean stating wether the item to be filtered passes the match conditions ... */
    function checkMatchWithInput(item)
    {
        var unmasked = fileMasker[item];
        fileNameArray = unmasked.split(".");
        
        // User might have dots in their file name
        var itsExtension = fileNameArray[fileNameArray.length - 1];
        
        var filename = unmasked.substring(0, unmasked.indexOf(itsExtension) - 1)
        
        return  matchLastModTag(unmasked) && matchFileTypeTag(itsExtension) && filename.toLowerCase().includes(matcher.toLowerCase());
    }

    /* ... Function that filters the file array according to the value from the UI input element ... */
    function filterValues(e)
    {
        // Getting the value typed
        matcher = e.target.value;
        var resultingMatches = Object.keys(filesArray).filter(checkMatchWithInput);

        setLoading();
        $("#filesListGrid").empty();

        filePromises = []
        // Loop through and display all results
        Object.keys(resultingMatches).forEach(
            function(item, index)
            {  
                var masker = resultingMatches[index];
                var theItem = fileMasker[masker];
                var intmLast = theItem.split('.')[theItem.split('.').length - 1];
                var file_Name = theItem.substring(0, theItem.indexOf(intmLast) - 1);
                var id_num = (parseInt(masker.split('_')[1]) + 1);
                
                $("#filesListGrid").append(
                    $("<div></div>").attr({"id": "result-" + id_num, "class": "search-result"}).append(
                        $("<img>").attr({"id": "file-"+id_num, "class": "result-file"}),
                        $("<div></div>").attr({"class": "result-file-name"}).text(file_Name)
                    )
                );
                
                displayFiles(theItem, id_num-1, file_Name, intmLast, "#file-"+id_num);
                $(".search-result").unbind('click').bind('click', fileClick);
            }
        );

        Promise.all(filePromises).then(doneLoading).catch(
            function()
            {
                console.log("there seems to be a problem sir!");
                doneLoading();
            });  
    }

    //var pdf_documents = [];

    var searchField = document.querySelector("#search-field-2");
    
    searchField.addEventListener('input', filterValues);

    $("#fileType-tag, #lastMod-tag").change(
        function()
        {
            const event = new Event('input');  
            searchField.dispatchEvent(event);
        }
    );

    // An array containing items to undo
    var itemsToUndo = {
        undoFrom: "",
        items: []
    };

    $("#package-navbar .undo-button").css("margin", "0px 8px 0px 8px").show();

    $("#deckName").on('keyup', 
        function (e) 
        {
            if (e.key === 'Enter' || e.keyCode === 13)
            $("#done-edit").trigger('click');
        }
    );

    // Click handler for the pencil edit button
    $("#pencil-edit").on('click',
        function()
        {
            $(this).hide();
            $("#deckName-written").hide();
            $("#deckName").val($("#deckName-written").text());
            $("#done-edit, #deckName").show()
            
        }
    );

    $("#done-edit").on('click',
        function()
        {
            $(this).hide();
            $("#deckName").hide();
            $("#deckName-written").text($("#deckName").val());
            $("#pencil-edit, #deckName-written").show()
        }
    );

    // Global list of objects(workspace and their contents)
    let Workspaces = [];

    // Add three divs to all view containers
    $(".workspace-viewers").append(
        $("<div></div>").attr({"class": "workspace-namer"}).append(
            $("<img>").attr({"src": "images/pencil.png", "class": "pencil-edit"}),
            $("<img>").attr({"src": "images/done.png", "class": "done-edit"}).css("display", "none"),
            $("<h3></h3>").attr({"class": "workspace-name-written"}),
            $("<input>").attr({"class": "workspace-name"}).css("display", "none"),
            $("<img>").attr({"src": "images/undo.png", "class": "undo-button inactive"}),
            $("<button>Save</button>").attr({"class": "save-deck collectionContainerbBtns inactive"})
        ),
        $("<div></div>").attr({"class": "workspace-displayer"}),
        $("<div></div>").attr({"class": "workspace-bottom-navbar"})
    );

    $(".workspace-name").on('keyup', 
        function (e) 
        {
            if (e.key === 'Enter' || e.keyCode === 13)
                $(this).parent().find(".done-edit").trigger('click');
        }
    );

    // Click handler for the pencil edit button
    $(".pencil-edit").on('click',
        function()
        {
            $(this).hide();
            $(this).next().next().hide();
            $(this).parent().find(".save-deck").hide();
            $(this).next().next().next().val($(this).next().next().text());
            $(this).next().show();
            $(this).next().next().next().show();
        }
    );

    $(".done-edit").on('click',
        function()
        {
            $(this).hide();
            $(this).next().next().hide();
            $(this).next().text($(this).next().next().val());
            $(this).parent().find(".save-deck").show();
            $(this).parent().find(".save-deck").removeClass("inactive");
            $(this).prev().show();
            $(this).next().show();
        }
    );

    $("#prevbtn-container").click(
        function()
        {
            if(window.getComputedStyle($("#nextbtn-container")[0]).display == "none")
                $("#nextbtn-container").show();

            var theSinglePage = $(".singlePage");

            theSinglePage.animate(
                {
                    left: "50px",
                    opacity: "0"
                },
            "slow");
            
            var nextSinglePage;
            setTimeout( 
                function() 
                {
                    var nextPage = $("#page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) - 1));
                    var nextPageOffset = pagesOffsets[("page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) - 1))];

                    var pagesList = $("#PagesListContainer")[0];
                    var offsetDifference = nextPageOffset - scrollAmount;
                    
                    if(offsetDifference < 10)
                    {
                        offsetDifference = offsetDifference * (-1);
                        var quot = ~~((offsetDifference + 10)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft - (quot*120);
                    }
                    else if(offsetDifference > 480)
                    {
                        var quot = ~~((offsetDifference - 480)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft + (quot*120);
                    }

                    nextPage.parent().trigger('click');
                    nextSinglePage = $(".singlePage");
                    nextSinglePage.css({"opacity": "0"});
                    nextSinglePage.animate({ left: "-60px"},"fast");
                    nextSinglePage.animate({ left: "+=60px", opacity: "1"},"slow");
                    
                    //console.log($("page_" +(parseInt(nextPage.attr("id").split('_')[1]) + 1)));
                    if($("#page_" +(parseInt(nextPage.attr("id").split('_')[1]) - 1)).length == 0)
                    {
                        $("#prevbtn-container").hide();
                    }
                },
            200);
        }
    );


    $("#nextbtn-container").click(
        function()
        {
            if(window.getComputedStyle($("#prevbtn-container")[0]).display == "none")
                $("#prevbtn-container").show();

            var theSinglePage = $(".singlePage");

            theSinglePage.animate(
                {
                    left: "-50px",
                    opacity: "0"
                },
            "slow");
            
            var nextSinglePage;
            setTimeout( 
                function() 
                {
                    var nextPage = $("#page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) + 1));
                    var nextPageOffset = pagesOffsets[("page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) + 1))];

                    var pagesList = $("#PagesListContainer")[0];
                    var offsetDifference = nextPageOffset - scrollAmount;
                    if(offsetDifference > 480)
                    {
                        var quot = ~~((offsetDifference - 480)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft + (quot*120);
                    }
                    else if(offsetDifference < 10)
                    {
                        offsetDifference = offsetDifference * (-1);
                        var quot = ~~((offsetDifference + 10)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft - (quot*120);
                    }

                    nextPage.parent().trigger('click');
                    nextSinglePage = $(".singlePage");
                    nextSinglePage.css({"opacity": "0"});
                    nextSinglePage.animate({ left: "60px"},"fast");
                    nextSinglePage.animate({ left: "-=60px", opacity: "1"},"slow");
                    
                    
                    if($("#page_" +(parseInt(nextPage.attr("id").split('_')[1]) + 1)).length == 0)
                    {
                        $("#nextbtn-container").hide();
                    }
                },
            200);
        }
    );
    
    $("#PagesListContainer").on('scroll',
        function()
        {
            var pagesListContainer = $(this)[0];
            let x = pagesListContainer.scrollLeft;

            scrollAmount = x.toFixed();
        }
    );

    // Making the view containers sortable
    $("#collectionViewer").sortable(
        {
            update: function(event, ui)
                    {
                        ui.item.parent().prev().find(".undo-button").addClass("inactive");
                    }
        }
    );

    $(".workspace-namer .undo-button").on('click',
        function()
        {
            var thisButton = $(this);
            thisButton.parent().find(".save-deck").removeClass("inactive");

            if((itemsToUndo_3[thisButton.parent().parent().attr("id")] != null) && itemsToUndo_3[thisButton.parent().parent().attr("id")].undoFrom == "insertPage")
            {
                var addedItemsArray = itemsToUndo_3[thisButton.parent().parent().attr("id")].items;
                addedItemsArray.forEach(
                    function(item)
                    {
                        item.remove();
                    }
                );
                addedItemsArray = [];
            }
            else
            {
                // itemsToUndo_2.items[0] = original position of the moved element
                // itemsToUndo_2.items[1] = the element node moved
                // itemsToUndo_2.items[2] = the element node behind the one moved
                // itemsToUndo_2.items[3] = New position of the moved element 
                var pack = wpActions[thisButton.parent().parent().attr("id")];
                if(pack != null)
                {
                    if(itemsToUndo_2.undoFrom == "sorting")
                    {
                        if(itemsToUndo_2.foreignFlag)
                        {
                            if(thisButton.parent().next().hasClass("theGiver"))
                            {
                                $(".theReceiver").children()[pack.items[3]].remove();
                                if(pack.items[0] == 0)
                                    thisButton.parent().next()[0].prepend(pack.items[1]);
                                
                                else
                                    pack.items[2].insertAdjacentElement("afterEnd", pack.items[1]);
                            }
                            else
                            {
                                thisButton.parent().next().children()[pack.items[3]].remove();
                                if(pack.items[0] == 0)
                                    $(".theGiver")[0].prepend(pack.items[1]);
                            
                                else
                                    pack.items[2].insertAdjacentElement("afterEnd", pack.items[1]);
                            }
                            $(".theReceiver, .theGiver").prev().find(".undo-button").addClass("inactive");
                        }
                        else
                        {
                            thisButton.parent().next().children()[pack.items[3]].remove();
                            if(pack.items[0] == 0)
                                thisButton.parent().next()[0].prepend(pack.items[1]);
                    
                            else
                                pack.items[2].insertAdjacentElement("afterEnd", pack.items[1]);
                        }
                    }
                    else if(pack.fromCancel)
                    {
                        thisButton.parent().next().find(".temporarily-hidden").removeClass("temporarily-hidden");
                        pack.fromCancel = false;
                    }   
                }
                else
                {
                    if(itemsToUndo_2.undoFrom == "sorting")
                    {
                        thisButton.parent().next().children()[itemsToUndo_2.items[3]].remove();
                            if(itemsToUndo_2.items[0] == 0)
                                thisButton.parent().next()[0].prepend(itemsToUndo_2.items[1]);
                    
                            else
                                itemsToUndo_2.items[2].insertAdjacentElement("afterEnd", itemsToUndo_2.items[1]);
                    }
                    else
                        thisButton.parent().next().find(".temporarily-hidden").removeClass("temporarily-hidden");
                } 
            }
            if(itemsToUndo_3[thisButton.parent().parent().attr("id")] != null)
                itemsToUndo_3[thisButton.parent().parent().attr("id")].undoFrom = "";        
            thisButton.addClass("inactive");
        }
    );
    
    var itemsToUndo_2 = {};
    var itemsToUndo_3 = {};
    itemsToUndo_2.undoFrom = "";
    itemsToUndo_2.foreignFlag = false;
    itemsToUndo_2.items = [];
    var wpActions = {}

    // Making the viewers sortable and connected to each to enable sort between
    $(".workspace-displayer").sortable(
        {
            connectWith: ".workspace-displayer",
            start: function(event, ui)
                    {
                        if(ui.item.parent().parent().attr("id") != "single-mode")
                        {
                            
                            $(".workspace-displayer").removeClass("temporaryGiver");
                            wpActions[ui.item.parent().parent().attr("id")] = { items: [], undoFrom: "", fromCancel: false};
                            var pack = wpActions[ui.item.parent().parent().attr("id")];
                            var undoList = pack.items;

                            itemsToUndo_2.foreignFlag = false;
                            undoList.push(ui.item.index());
                            undoList.push(ui.item[0]);
                            undoList.push(ui.item.prev()[0]);

                            ui.item.parent().addClass("temporaryGiver");
                        }
                        else
                        {
                            itemsToUndo_2.items = [];
                            itemsToUndo_2.foreignFlag = false;
                            itemsToUndo_2.items.push(ui.item.index());
                            itemsToUndo_2.items.push(ui.item[0]);
                            itemsToUndo_2.items.push(ui.item.prev()[0]);
                        }
                    },
            update: function(event, ui)
                    {
                        ui.item.parent().prev().find(".save-deck, .undo-button").removeClass("inactive");
                        itemsToUndo_2.undoFrom = "sorting";
                        if(itemsToUndo_3[ui.item.parent().parent().attr("id")] != null)
                            itemsToUndo_3[ui.item.parent().parent().attr("id")].undoFrom = "";

                        if(ui.item.parent().parent().attr("id") != "single-mode")
                        {
                            var theGiverPack = wpActions[$(".temporaryGiver").parent().attr("id")];                            

                            if(!itemsToUndo_2.foreignFlag)
                            {
                                theGiverPack.undoFrom = "sorting-within";
                                theGiverPack.items.push(ui.item.index());

                                if(ui.item.parent().hasClass("theGiver") && wpActions[$(".theReceiver").parent().attr("id")].undoFrom == "sorting-external")
                                    $(".theReceiver").prev().find(".undo-button").addClass("inactive");

                                else if(ui.item.parent().hasClass("theReceiver") && wpActions[$(".theGiver").parent().attr("id")].undoFrom == "sorting-external")
                                    $(".theGiver").prev().find(".undo-button").addClass("inactive");

                            }
                            else
                            {
                                wpActions[ui.item.parent().parent().attr("id")] = { items: theGiverPack.items, undoFrom: "sorting-external", fromCancel: false };
                                $(".workspace-displayer").removeClass("theGiver");
                                $(".temporaryGiver").addClass("theGiver")
                                $(".theGiver").removeClass("temporaryGiver");
                                theGiverPack.undoFrom = "sorting-external";
                                
                                if(itemsToUndo_3[$(".theGiver").parent().attr("id")] != null)
                                    itemsToUndo_3[$(".theGiver").parent().attr("id")].undoFrom = "";

                                $(".workspace-displayer").removeClass("theReceiver");
                                ui.item.parent().addClass("theReceiver");
                        
                                $(".theGiver").prev().find(".save-deck, .undo-button").removeClass("inactive");

                                var isolatedWorkspace = $(".workspace-displayer:not(.theGiver):not(.theReceiver):eq(1)");

                                if(wpActions[isolatedWorkspace.parent().attr("id")] != null)
                                    if(wpActions[isolatedWorkspace.parent().attr("id")].undoFrom == "sorting-external")
                                    isolatedWorkspace.prev().find(".undo-button").addClass("inactive");
                            }
                        }
                        else
                            itemsToUndo_2.items.push(ui.item.index());

                    },
            receive: function(event, ui)
                    {
                        itemsToUndo_2.foreignFlag = true;
                    }
        }
    );

    // To be changed
    $("#single-mode .workspace-displayer").addClass("single-file-mode");
    
    // Looping through all bottom navigation bars and adding the select options
    var allBottomBars = $(".workspace-bottom-navbar");
    for(var k = 0; k < allBottomBars.length; k++)
    {
        $(".workspace-bottom-navbar:eq(" + k + ")").append(
            $("<label>Select deck to view: </label>").attr({"for": "deck-to-view-"+(k+1)}),
            $("<select></select>").attr({"id": "deck-to-view-"+(k+1), "class": "deck-to-view-options collectionContainerbBtns"}).append(
                $("<option></option>").attr({"class": "decks-options"}).text("")
            ),
            $("<label>Export as: </label>").attr({"for": "deck-to-export-"+(k+1)}),
            $("<select></select>").attr({"id": "deck-to-export-"+(k+1), "class": "deck-to-export-options collectionContainerbBtns"}).append(
                $("<option></option>").attr({"class": "decks-options emptyOption"}).text(""),
                $("<option></option>").attr({"class": "decks-options Pdf"}).text("Pdf(.pdf)"),
                $("<option></option>").attr({"class": "decks-options"}).text("Powerpoint(.pptx)")
            )
        );
    }

    $(".deck-to-export-options").change(
        function()
        {
            $(this).parent().prev().prev().find(".save-deck").removeClass("inactive");
        }
    );


    // The Save button on a viewer
    // When clicked it saves the content currently present
    $(".workspace-namer .save-deck").on('click',
        function()
        {
            setLoading();
            var thisButton = $(this);
            thisButton.parent().next().find(".temporarily-hidden, .permanently-hidden").detach();
            thisButton.parent().find(".undo-button").addClass("inactive");
            Workspaces.forEach(
                function(item)
                {
                    if(item.fileName == thisButton.parent().next().next().find(".deck-to-view-options").val())
                    {
                        var theMask = Object.keys(fileMasker_1).find(key => fileMasker_1[key] === item.fileName);
                        var videoFound = false;

                        item.fileName = thisButton.parent().find(".workspace-name-written").text();
                        $(".deck-to-view-options").find("." + theMask).text(item.fileName);
                        fileMasker_1[theMask] = item.fileName;
                        $("#full-mode").find("#"+theMask).text(item.fileName)
                        
                        item.fileContents = [];
                        
                        var currentContent = thisButton.parent().next().children();

                        for(var sv = 0; sv < currentContent.length; sv++)
                        {
                            var theElement = currentContent[sv];
                            
                            var objectPushed = {
                                fileFrom: fileMasker[theElement.classList[1]],
                                pageNumber: theElement.firstChild.lastChild.innerHTML,
                                imageData: theElement.firstChild.firstChild.nodeName.toLowerCase() == "video" ? 
                                            theElement.firstChild.firstChild.getAttribute("src") + "-thisIsVideo":
                                            theElement.firstChild.firstChild.getAttribute("src")
                            }
                            item.fileContents.push(objectPushed);

                            if(objectPushed.imageData.includes("-thisIsVideo"))
                                videoFound = true
                        }
                        if(videoFound)
                            item.type = "powerpoint";
                        else
                            item.type = "any";

                        item.exportAs = item.type == "any" ? thisButton.parent().next().next().find(".deck-to-export-options").val(): "Powerpoint(.pptx)";
                        
                        item.tags = [];
                        theTags = $("#tagsBatch").children();
                        for(let bn = 0; bn < theTags.length; bn++)
                        {
                            item.tags.push(theTags[bn].firstChild.innerHTML);
                        }
                        return;
                    }
                }
            );
            doneLoading();
            thisButton.addClass("inactive");
        }
    );

    $("#tagInput").on('keyup',
        function(e)
        {
            if(e.key === 'Enter' || e.keyCode === 13)
            {
                $("#tagsBatch").append(
                    $("<div></div>").attr({"class": "upperTagContainer"}).append(
                        $("<div></div>").attr({"class": "tagContent"}).text($("#tagInput")[0].value),
                        $("<div></div>").attr({"class": "cancelContainer-2 deckItem"}).append(
                            $("<div></div>").attr({"class": "removeTag"}).append(
                                $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                            )
                        )
                    )
                );

                $(".removeTag").unbind('click').bind('click',
                    function()
                    {
                        $(this).parent().parent().detach();
                        $("#single-mode").find(".save-deck").removeClass("inactive");
                    }
                );

                $("#single-mode").find(".save-deck").removeClass("inactive");
                $("#tagInput").val("");
            }
        }
    );


    // Select options which determine which workspace to view
    $(".deck-to-view-options").change(
        function()
        {
            var thisOption = $(this);
            $("#tagsBatch").empty();
            
            // Setting the default name to show up in the input field
            thisOption.parent().prev().prev().children()[2].innerHTML = thisOption.val();
            
            // Clearing the viewer
            let workspaceDisplayer = thisOption.parent().prev();
            workspaceDisplayer.empty();

            // Getting selected option
            let value = thisOption.val();
            // If the blank option is selected
            if(value == "")
            {
                thisOption.parent().prev().prev().find("*").hide();
            }
            else
            {
                thisOption.parent().prev().prev().find(".undo-button, .save-deck").addClass("inactive");
                thisOption.parent().prev().prev().children(":first").show();
                thisOption.parent().prev().prev().find(".workspace-name-written").show();
                thisOption.parent().prev().prev().find(".undo-button").show();
                thisOption.parent().prev().prev().children(":last").show();

                // Looping the Workspaces to find the one selected
                for(var indexOfWorkspace = 0;  indexOfWorkspace < Workspaces.length; indexOfWorkspace++)
                {
                    if(Workspaces[indexOfWorkspace].fileName == value)
                    {
                        let theWorkspace = Workspaces[indexOfWorkspace];
                        
                        // Setting the default export type of the file
                        thisOption.next().next().val(theWorkspace.exportAs);

                        // Checking if default export type is powerpoint
                        if(theWorkspace.type == "any")
                            thisOption.next().next().find(".Pdf, .emptyOption").show();
                        else
                            thisOption.next().next().find(".Pdf, .emptyOption").hide();

                        // Looping through workspace contents to add them to the viewer
                        for(let g = 0; g < theWorkspace.fileContents.length; g++)
                        {                  
                            let clonedItem = document.createElement("div");

                            document.getElementById(thisOption.parent().parent().attr("id")).childNodes[1].appendChild(clonedItem);
                            
                            var elementAdded = document.getElementById(thisOption.parent().parent().attr("id")).childNodes[1].lastChild;

                            elementAdded.id = "itemNum-" + indexOfWorkspace + "-" + g;
                            
                            // If we are in two-mode display, change the cloned item into two-mode view sizing
                            if(workspaceDisplayer.hasClass("two-view-display"))
                            {
                                elementAdded.classList.add("wholeSlideContainer-2");
                                elementAdded.classList.add(Object.keys(fileMasker).find(key => fileMasker[key] === theWorkspace.fileContents[g].fileFrom));
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                        theWorkspace.fileContents[g].imageData.includes("-thisIsVideo") ?
                                        $("<video>").attr({"src": theWorkspace.fileContents[g].imageData.substring(0, theWorkspace.fileContents[g].imageData.indexOf("-thisIsVideo")), "class": "filePagePreviewed-2"}) : 
                                        $("<img>").attr({"src": theWorkspace.fileContents[g].imageData, "class": "filePagePreviewed-2"}),
                                        $("<div></div>").attr({"class": " mediumPageNumber pageNumber"}).text(theWorkspace.fileContents[g].pageNumber)
                                    )[0]
                                );
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                        $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                        )
                                    )[0]
                                );
                                /* ... This prevented a user from viewing two files at once
                                /* $("#itemNum-" + indexOfWorkspace + "-" + g).addClass("wholeSlideContainer-2 "+theWorkspace.fileContents[g].fileFrom).append(
                                    $("<div></div>").attr({"class": "pageDisplayItem deckItem deckLowerItem"}).append(
                                        $("<img>").attr({"src": theWorkspace.fileContents[g].imageData, "class": "filePagePreviewed-2"}),
                                        $("<div></div>").attr({"class": "pageNumber"}).text(theWorkspace.fileContents[g].pageNumber)
                                    ),
                                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                        $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                        )
                                    )
                                ); */
                            }
                            // If we are in three-mode display, change the cloned item into three-mode view sizing
                            else if(workspaceDisplayer.hasClass("three-view-display"))
                            {
                                elementAdded.classList.add("wholeSlideContainer-3");
                                elementAdded.classList.add(Object.keys(fileMasker).find(key => fileMasker[key] === theWorkspace.fileContents[g].fileFrom));
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                        theWorkspace.fileContents[g].imageData.includes("-thisIsVideo") ?
                                        $("<video>").attr({"src": theWorkspace.fileContents[g].imageData.substring(0, theWorkspace.fileContents[g].imageData.indexOf("-thisIsVideo")), "class": "filePagePreviewed-3"}) : 
                                        $("<img>").attr({"src": theWorkspace.fileContents[g].imageData, "class": "filePagePreviewed-3"}),
                                        $("<div></div>").attr({"class": "smallPageNumber pageNumber"}).text(theWorkspace.fileContents[g].pageNumber)
                                    )[0]
                                );
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                        $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                        )
                                    )[0]
                                );
                            }
                            // Otherwise we are in single view mode, changing cloned item into single-mode sizing
                            else
                            {
                                if(g == 0)
                                {
                                    $("#add-tags-heading, #tagsContainer").animate( {opacity: "100%"}, 600);
                                    $("#deckContainer").animate( {"margin-left": "0px"}, 600 );
                                    $("#tagsContainer").removeClass("invisible");
                                    $("#tagInput").removeClass("inactive");
                                }
                                elementAdded.classList.add("wholeSlideContainer-1");
                                elementAdded.classList.add(Object.keys(fileMasker).find(key => fileMasker[key] === theWorkspace.fileContents[g].fileFrom));
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                        theWorkspace.fileContents[g].imageData.includes("-thisIsVideo") ?
                                        $("<video>").attr({"src": theWorkspace.fileContents[g].imageData.substring(0, theWorkspace.fileContents[g].imageData.indexOf("-thisIsVideo")), "class": "filePagePreviewed-1"}) : 
                                        $("<img>").attr({"src": theWorkspace.fileContents[g].imageData, "class": "filePagePreviewed-1"}),
                                        $("<div></div>").attr({"class": "pageNumber"}).text(theWorkspace.fileContents[g].pageNumber)
                                    )[0]
                                );
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                        $("<div></div>").attr({"class": "cancelBtn"}).append(
                                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                        )
                                    )[0]
                                );
                            }
                        }

                        for(let lt = 0; lt < theWorkspace.tags.length; lt++)
                        {
                            $("#tagsBatch").append(
                                $("<div></div>").attr({"class": "upperTagContainer"}).append(
                                    $("<div></div>").attr({"class": "tagContent"}).text(theWorkspace.tags[lt]),
                                    $("<div></div>").attr({"class": "cancelContainer-2 deckItem"}).append(
                                        $("<div></div>").attr({"class": "removeTag"}).append(
                                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                        )
                                    )
                                )
                            );
                        }
                        $(".removeTag").unbind('click').bind('click',
                            function()
                            {
                                $(this).parent().parent().detach();
                                $("#single-mode").find(".save-deck").removeClass("inactive");
                            }
                        );
                        break;
                    }
                }

                // On click handler for cancel button
                // Remove file when button clicked
                $(".cancelBtn").unbind('click').bind('click', workspaceUndo);
            }
        }
    );


    var fromState = "";
    // Select options
    $('#select-number-of-decks').change(
        function()
        {
            // When View mode is changed clear contents of all displayers
            $(".workspace-displayer").empty();

            // Set default export values(Will maybe be changed Later)
            $(".deck-to-export-options").val("");

            var value = $(this).val();
            // Full list mode
            if(value == "Full list")
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn")[0].innerHTML = "A<br>d<br>d<br><br>t<br>o<br><br>D<br>e<br>c<br>k";
                $("#addPagesToDeckbtn").addClass("inactive").addClass("unclickable");
                $("#insertInto-1, #insertInto-2, #insertInto-3").fadeOut();
                $("#package-navbar .undo-button").show();
                $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
                $("#tagsContainer").addClass("invisible");
                $("#tagInput").addClass("inactive");
                $("#deckContainer").animate( {"margin-left": "60px"}, 600 );

                // whenever someone proceeds to view list of workspaces, clear all workspace viewers
                $(".deck-to-view-options").val("");
                $(".deck-to-view-options").trigger('change');

                $("#workspace-1, #full-mode").show();
                $("#single-mode, .two-view, .three-view").hide();
            }
            // One deck mode
            else if (value == "1 deck")
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn").removeClass("inactive");
                $("#addPagesToDeckbtn")[0].innerHTML = "I<br>n<br>s<br>e<br>r<br>t<br><br>I<br>n<br>t<br>o";
                $("#insertInto-2, #insertInto-3").fadeOut();
                $("#insertInto-1").fadeIn();
                $("#package-navbar .undo-button").hide();

                $("#workspace-1, #single-mode").show();
                $("#full-mode, .two-view, .three-view").hide();

                // Placing in this current viewer-1, the contents that were in previous viewer-1
                $("#single-mode .workspace-bottom-navbar .deck-to-view-options").val( $("#workspace-2 .workspace-bottom-navbar .deck-to-view-options").val() );
                $("#single-mode .workspace-bottom-navbar .deck-to-view-options").trigger('change');

                // Recording what view mode we are coming from
                fromState = "1 deck";
            }
            // Two deck mode
            else if(value == "2 decks")
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn").removeClass("inactive");
                $("#addPagesToDeckbtn")[0].innerHTML = "I<br>n<br>s<br>e<br>r<br>t<br><br>I<br>n<br>t<br>o";
                $("#insertInto-3").fadeOut();
                $("#insertInto-1, #insertInto-2").fadeIn();
                $("#package-navbar .undo-button").hide();
                $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
                $("#tagsContainer").addClass("invisible");
                $("#tagInput").addClass("inactive");
                $("#deckContainer").animate( {"margin-left": "60px"}, 600 );
                
                // Simply changing viewer 2 and 3 into two-mode view
                $(".three-view:not(.three-view:last-child)").addClass("two-view");
                $(".three-view:not(.three-view:last-child)").removeClass("three-view");
                $("#workspace-1, .three-view").hide();

                $(".two-view").show();
                $(".two-view .workspace-displayer").removeClass("three-view-display");
                $(".two-view .workspace-displayer").addClass("two-view-display");

                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4, #deck-to-export-2, #deck-to-export-3, #deck-to-export-4").removeClass("minimised-width");
                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4, #deck-to-export-2, #deck-to-export-3, #deck-to-export-4").addClass("regular-width");
                
                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4").removeClass("minimised-mode-spacing");
                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4").addClass("regular-mode-spacing");

                // If we are from view mode 1
                if(fromState == "1 deck")
                {
                    // Placing in this current viewer-1, the contents that were in previous viewer-1
                    $("#workspace-2 .workspace-bottom-navbar .deck-to-view-options").val( $("#single-mode .workspace-bottom-navbar .deck-to-view-options").val() );
                    $("#workspace-2 .workspace-bottom-navbar .deck-to-view-options").trigger('change');
                }
                // Triggering the dropdown to open contents
                $(".two-view .workspace-bottom-navbar .deck-to-view-options").trigger('change');

                // Recording what view mode we are coming from
                fromState = "2 decks";
            }
            // Three deck mode
            else
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn").removeClass("inactive");
                $("#addPagesToDeckbtn")[0].innerHTML = "I<br>n<br>s<br>e<br>r<br>t<br><br>I<br>n<br>t<br>o";
                $("#insertInto-1, #insertInto-2, #insertInto-3").fadeIn();
                $("#package-navbar .undo-button").hide();
                $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
                $("#tagsContainer").addClass("invisible");
                $("#tagInput").addClass("inactive");
                $("#deckContainer").animate( {"margin-left": "60px"}, 600 );
                
                // Simply changing viewer 2 and 3 into three-mode view
                $("#workspace-1").hide();
                $(".two-view").addClass("three-view");
                $(".two-view").removeClass("two-view");

                $(".three-view").show();
                $(".three-view .workspace-displayer").removeClass("two-view-display");
                $(".three-view .workspace-displayer").addClass("three-view-display");

                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4, #deck-to-export-2, #deck-to-export-3, #deck-to-export-4").removeClass("regular-width");
                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4, #deck-to-export-2, #deck-to-export-3, #deck-to-export-4").addClass("minimised-width");

                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4").addClass("minimised-mode-spacing");
                $("#deck-to-view-2, #deck-to-view-3, #deck-to-view-4").removeClass("regular-mode-spacing");

                // If we are from view mode 1
                if(fromState == "1 deck")
                {
                    // Placing in this current viewer-1, the contents that were in previous viewer-1
                    $("#workspace-2 .workspace-bottom-navbar .deck-to-view-options").val( $("#single-mode .workspace-bottom-navbar .deck-to-view-options").val() );
                    $("#workspace-2 .workspace-bottom-navbar .deck-to-view-options").trigger('change');
                }
                // Triggering the dropdown to open contents
                $(".three-view .workspace-bottom-navbar .deck-to-view-options").trigger('change');

                // Recording what view mode we are coming from
                fromState = "3 decks";
            }
        }
    );

    // When undo button is clicked
    $("#package-navbar .undo-button").on('click',
        function undoFunctionality()
        {
            if(itemsToUndo.undoFrom == "addPages")
            {
                // This undo functionality is not complete
                itemsToUndo.items.forEach( (item) => { item.detach() } );
                
            }
            else if(itemsToUndo.undoFrom == "removePage")
            {
                var prevElement = itemsToUndo.items[1];
                var nextElement = itemsToUndo.items[2];

                if(prevElement.length == 1)
                    prevElement[0].insertAdjacentElement("afterEnd", itemsToUndo.items[0][0]);
                else if (nextElement.length == 1)
                    $("#collectionViewer")[0].insertBefore(itemsToUndo.items[0][0], nextElement[0]);
                else
                    $("#collectionViewer")[0].appendChild(itemsToUndo.items[0][0]);
            }
            else if(itemsToUndo.undoFrom == "removeDeck")
            {
                var prevElement = itemsToUndo.items[3];
                var nextElement = itemsToUndo.items[4];

                if(prevElement.length == 1)
                    prevElement[0].insertAdjacentElement("afterEnd", itemsToUndo.items[2][0]);
                else if (nextElement.length == 1)
                    $("#full-mode")[0].insertBefore(itemsToUndo.items[2][0], nextElement[0]);
                else
                    $("#full-mode")[0].appendChild(itemsToUndo.items[2][0]);

                Workspaces.splice(itemsToUndo.items[0], 0, itemsToUndo.items[1]);

            }

            $(this).addClass("inactive");
            itemsToUndo.items = [];
        }
    );

    var pressedDown = false;

    $("#addPagesToDeckbtn").on('mousedown',
        function()
        {
            $(this).addClass("pressed");
            pressedDown = true;
        }    
    )
    
    $("#addPagesToDeckbtn").on('mouseleave',
        function()
        {
            if(pressedDown)
            {
                $(this).removeClass("pressed");
                pressedDown = false;
            }
        }    
    )

    function minorBtnsClickHandler(theDisplayer)
    {
        var indexOfWorkspace;
        for(let  i = 0; i < Workspaces.length; i++)
        {
            if(Workspaces[i].fileName == theDisplayer.prev().find(".workspace-name-written").text())
            {
                indexOfWorkspace = i;
                break;
            }    
        }
        if(indexOfWorkspace != null)
            itemsToUndo_3[theDisplayer.parent().attr("id")] = { undoFrom: "insertPage", items: [] };


        if($("#filePreviewGrid").hasClass("videoOnDisplay"))
        {
            if(indexOfWorkspace != null)
                theDisplayer.prev().find(".save-deck, .undo-button").removeClass("inactive");
            var theVideo = $("#filePreviewGrid").children()[0];
            var theVideoNameMask = theVideo.getAttribute("id");
            if($("#canv-"+theVideoNameMask).length == 0)
            {
                var canv = document.createElement("canvas");
                document.body.appendChild(canv);
                canv.width = 400;
                canv.height = 400;
                canv.id = "canv-"+theVideoNameMask;
                canv.getContext('2d').drawImage(theVideo, 0, 0, canv.width, canv.height);
                canv.style.display = "none";
            }

            let clonedItem = document.createElement("div");
            theDisplayer[0].appendChild(clonedItem);
            var elementAdded = theDisplayer[0].lastChild;
            elementAdded.id = "itemNum-" + indexOfWorkspace + "-" + parseInt(theDisplayer.children().length - 1);
            
            if(theDisplayer.hasClass("two-view-display"))
            {
                elementAdded.classList.add("wholeSlideContainer-2");
                elementAdded.classList.add(theVideo.getAttribute("id").split('-')[0]);
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                        $("<video>").attr({"src": theVideo.lastChild.getAttribute("src"), "class": "filePagePreviewed-2"}),
                        $("<div></div>").attr({"class": " mediumPageNumber pageNumber"}).text(fileMasker[theVideoNameMask])
                    )[0]
                );
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                        $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                        )
                    )[0]
                );
            }
            else if(theDisplayer.hasClass("three-view-display"))
            {
                elementAdded.classList.add("wholeSlideContainer-3");
                elementAdded.classList.add(theVideo.getAttribute("id").split('-')[0]);
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                        $("<video>").attr({"src": theVideo.lastChild.getAttribute("src"), "class": "filePagePreviewed-3"}),
                        $("<div></div>").attr({"class": " smallPageNumber pageNumber"}).text(fileMasker[theVideoNameMask])
                    )[0]
                );
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                        $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                        )
                    )[0]
                );
            }
            else
            {
                elementAdded.classList.add("wholeSlideContainer-1");
                elementAdded.classList.add(theVideo.getAttribute("id").split('-')[0]);
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                        $("<video>").attr({"src": theVideo.lastChild.getAttribute("src"), "class": "filePagePreviewed-1"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(fileMasker[theVideoNameMask])
                    )[0]
                );
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                        $("<div></div>").attr({"class": "cancelBtn"}).append(
                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                        )
                    )[0]
                );
            }
            itemsToUndo_3[theDisplayer.parent().attr("id")].items.push(elementAdded);
        }
        else if($("#filePreviewGrid").hasClass("imageOnDisplay"))
        {
            console.log("planning...");
        }
        else
        {
            var selectedPages = $("#filePreviewGrid .pageSelected");

            document.getElementById('select-all-pages').checked = false;

            if(selectedPages.length > 0)
            {
                if(indexOfWorkspace != null)
                    theDisplayer.prev().find(".save-deck, .undo-button").removeClass("inactive");

                // Loop through all selected items
                for(let i = 0; i < selectedPages.length; i++) 
                {
                    let item = selectedPages[i];
                    item.classList.remove("pageSelected");
                    var idNumber = item.firstChild.getAttribute("id").split('-')[1];
                    $("#page_"+idNumber).parent().next().children()[0].checked = false;

                    let clonedItem = document.createElement("div");
                    theDisplayer[0].appendChild(clonedItem);
                    var elementAdded = theDisplayer[0].lastChild;
                    elementAdded.id = "itemNum-" + indexOfWorkspace + "-" + parseInt(theDisplayer.children().length - 1);
                    
                    if(theDisplayer.hasClass("two-view-display"))
                    {
                        elementAdded.classList.add("wholeSlideContainer-2");
                        elementAdded.classList.add(item.getAttribute("id").split('-')[0]);
                        elementAdded.appendChild(
                            $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                $("<img>").attr({"src": item.firstChild.getAttribute("src"), "class": "filePagePreviewed-2"}),
                                $("<div></div>").attr({"class": " mediumPageNumber pageNumber"}).text(item.lastChild.innerHTML)
                            )[0]
                        );
                        elementAdded.appendChild(
                            $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                                    $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                )
                            )[0]
                        );
                    }
                    else if(theDisplayer.hasClass("three-view-display"))
                    {
                        elementAdded.classList.add("wholeSlideContainer-3");
                        elementAdded.classList.add(item.getAttribute("id").split('-')[0]);
                        elementAdded.appendChild(
                            $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                $("<img>").attr({"src": item.firstChild.getAttribute("src"), "class": "filePagePreviewed-3"}),
                                $("<div></div>").attr({"class": " smallPageNumber pageNumber"}).text(item.lastChild.innerHTML)
                            )[0]
                        );
                        elementAdded.appendChild(
                            $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                $("<div></div>").attr({"class": "cancelBtn cancelBtn-scaled"}).append(
                                    $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                )
                            )[0]
                        );
                    }
                    else
                    {
                        elementAdded.classList.add("wholeSlideContainer-1");
                        elementAdded.classList.add(item.getAttribute("id").split('-')[0]);
                        elementAdded.appendChild(
                            $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                $("<img>").attr({"src": item.firstChild.getAttribute("src"), "class": "filePagePreviewed-1"}),
                                $("<div></div>").attr({"class": "pageNumber"}).text(item.lastChild.innerHTML)
                            )[0]
                        );
                        elementAdded.appendChild(
                            $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                $("<div></div>").attr({"class": "cancelBtn"}).append(
                                    $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                )
                            )[0]
                        );
                    }
                    itemsToUndo_3[theDisplayer.parent().attr("id")].items.push(elementAdded);
                }
            }
        } 
    }

    $(".smallerInsert").on('click', 
        function()
        {
            var buttonValue = $(this).text();
            var theDisplayer = $(".workspace-displayer:eq("+ buttonValue +")");

            if(buttonValue == "1" && (window.getComputedStyle($("#insertInto-2")[0]).display == "none" && window.getComputedStyle($("#insertInto-3")[0]).display == "none"))
                minorBtnsClickHandler($(".workspace-displayer:eq("+ (parseInt(buttonValue) - 1) +")"));
            else
                minorBtnsClickHandler(theDisplayer);
            
            $(".cancelBtn").unbind('click').bind('click', workspaceUndo); 
        }
    );

    // The Top Right Button on the right Preview Grid
    // On click, adds all selected items to lower Collection grid
    $("#addPagesToDeckbtn").on('mouseup',
    function()
    {
        $(this).removeClass("pressed");

        itemsToUndo.undoFrom = "addPages";
        itemsToUndo.items = [];

        if($("#filePreviewGrid").hasClass("videoOnDisplay"))
        {
            var theVideo = $("#filePreviewGrid").children()[0];
            var theVideoNameMask = theVideo.getAttribute("id");
            var theVideoName = fileMasker[theVideoNameMask];
            
            $("#package-navbar .undo-button").removeClass("inactive");                        

            // Adding the item to the things to undo array
            itemsToUndo.items.push(
                $("<div></div>").attr({"id": theVideoNameMask+"-"+theVideoNameMask, "class": "wholeSlideContainer"}).append(                
                    $("<div</div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                        $("<video></video>").attr({"src": "files/"+theVideoName, "class": "filePagePreviewed_1"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(theVideoName)
                    ),
                    $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                        $("<div></div>").attr({"class": "cancelBtn"}).append(
                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                        )
                    )
                )
            );

            // Append selected items to the collection viewer grid
            $("#collectionViewer").append(itemsToUndo.items[0]);
            
            if($("#canv-"+theVideoNameMask).length == 0)
            {
                var canv = document.createElement("canvas");
                document.body.appendChild(canv);
                canv.width = 400;
                canv.height = 400;
                canv.id = "canv-"+theVideoNameMask;
                canv.getContext('2d').drawImage(theVideo, 0, 0, canv.width, canv.height);
                canv.style.display = "none";
            }
        }
        else if($("#filePreviewGrid").hasClass("imageOnDisplay"))
        {
            console.log("planning...");
        }
        else
        {
            var selectedPages = $("#filePreviewGrid .pageSelected");

            document.getElementById('select-all-pages').checked = false;

            if(selectedPages.length > 0)
            {
                $("#package-navbar .undo-button").removeClass("inactive");

                // Loop through all selected items
                for(let i = 0; i < selectedPages.length; i++) 
                {
                    let item = selectedPages[i];

                    //var fileItsFromMask = Object.keys(fileMasker).find(key => fileMasker[key] === item.getAttribute("id").split("-")[0]);
                    
                    item.classList.remove("pageSelected");
                    var idNumber = item.firstChild.getAttribute("id").split('-')[1];
                    $("#page_"+idNumber).parent().next().children()[0].checked = false;

                    // Adding the item to the things to undo array
                    itemsToUndo.items.push(
                        $("<div></div>").attr({"id": item.getAttribute("id").split("-")[0]+"-"+item.lastChild.innerHTML, "class": "wholeSlideContainer"}).append(
                            $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                $("<img>").attr({"src": item.firstChild.getAttribute("src"), "class": "filePagePreviewed_1"}),
                                $("<div></div>").attr({"class": "pageNumber"}).text(item.lastChild.innerHTML)
                            ),
                            $("<div></div>").attr({"class": "cancelContainer deckItem"}).append(
                                $("<div></div>").attr({"class": "cancelBtn"}).append(
                                    $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                                )
                            )
                        )
                    );

                    // Append selected items to the collection viewer grid
                    $("#collectionViewer").append(itemsToUndo.items[i]);
                }
            }
        }
        // On click handler for cancel button
        // Remove file when button clicked
        $(".wholeSlideContainer").find(".cancelBtn").unbind('click').bind('click',
            function()
            {
                $("#package-navbar .undo-button").removeClass("inactive");
                itemsToUndo.undoFrom = "removePage";
                itemsToUndo.items = [];
                itemsToUndo.items.push($(this).parent().parent());
                itemsToUndo.items.push($(this).parent().parent().prev());
                itemsToUndo.items.push($(this).parent().parent().next());
                $(this).parent().parent().detach();
            }
        );
    }); 


    // Button in the navigation bar of the Collection Grid
    // On click, stacks the items together into a workspace and shows whole list of workspaces(mini-collections)
    $("#create-new-workspace").on('click',
    function()
    {
        $("#insertInto-1, #insertInto-2, #insertInto-3").fadeOut();
        $("#addPagesToDeckbtn").removeClass("inactive").removeClass("unclickable");
        $("#addPagesToDeckbtn")[0].innerHTML = "A<br>d<br>d<br><br>t<br>o<br><br>D<br>e<br>c<br>k";

        $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
        $("#tagsContainer").addClass("invisible");
        $("#tagInput").addClass("inactive");
        $("#deckContainer").animate( {"margin-left": "60px"}, 600 );
        // Activate undo button
        $("#package-navbar .undo-button").addClass("inactive").show();

        $(".deck-to-export-options").val("");
        // whenever someone proceeds to add new workspace, clear all workspace viewers
        $(".deck-to-view-options").val("");
        $(".deck-to-view-options").trigger('change');

        // Emptying the container, for it to carry new contents to be added
        $("#collectionViewer").empty();
        // Hide this button, and all other irrelevant ones 
        $(this).hide();
        $("#viewMode-label, #select-number-of-decks, #innerDecksViewer, #create-new-workspace, #revert-to-original").hide();
        $("#add-to-workspace, #collectionViewer, #backButton").show();
    });

    function backToFullList()
    {
        // Deactivate undo button
        $("#package-navbar .undo-button").addClass("inactive").hide();

        // Hide all other irrelevant ones
        $("#collectionViewer, #split-to-decks, #backButton, #add-to-workspace").hide();
        // Change to full list view
        $('#select-number-of-decks').val('Full list');
        $('#select-number-of-decks').trigger('change');
        $("#innerDecksViewer, #create-new-workspace, #viewMode-label, #select-number-of-decks").show();
    }

    // Back button in the navigation bar of the Collection grid
    // On click it simply brings user back to Full list view
    $("#backButton").on('click', backToFullList);

    // Button in the naviigation bar of the Collection Grid
    // On click, stacks the items together into a workspace and shows whole list of workspaces(mini-collections)
    $("#add-to-workspace").on('click',
    function()
    {            
        // Get the items in the container
        var collChildren = $("#collectionViewer").children();

        if(collChildren.length > 0)
        {
            // Array to hold objects(each object holds certain Page data)
            var collectionChildren = [];
            var videoFound = false;
            // Loop through container items
            for(let ch = 0; ch < collChildren.length; ch++)
            {
                var idSplitted = collChildren[ch].getAttribute("id").split("-");

                var objectPushed = {
                    fileFrom: fileMasker[idSplitted[0]],
                    pageNumber: collChildren[ch].firstChild.firstChild.nodeName.toLowerCase() == "video" ? fileMasker[idSplitted[1]] : idSplitted[1],
                    imageData: collChildren[ch].firstChild.firstChild.nodeName.toLowerCase() == "video" ? 
                                collChildren[ch].firstChild.firstChild.getAttribute("src") + "-thisIsVideo":
                                collChildren[ch].firstChild.firstChild.getAttribute("src")
                }
                if(objectPushed.imageData.includes("-thisIsVideo"))
                    videoFound = true;
                collectionChildren.push(objectPushed);
            }

            backToFullList();

            var num = Workspaces.length+1;
            var newWorspacename = "Filename-"+ num;
            fileMasker_1["mask_" + num] = newWorspacename;

            // Create mini-deck for workspace
            $("#full-mode").append(
                $("<div></div>").attr({"class": "upperWSContainer"}).append(
                    $("<div></div>").attr({"id": "mask_"+num, "class": "theWorkspaces"}).text(newWorspacename),
                    $("<div></div>").attr({"class": "cancelContainer-2"}).append(
                        $("<div></div>").attr({"class": "removeDeck"}).append(
                            $("<img>").attr({"src": "images/cancelbtn.png", "class": "cancelImg"})
                        )
                    )
                )
            );                  
            
            $(".removeDeck").unbind('click').bind('click',
                function()
                {
                    var thisButton = $(this);
                    var theWorkspace = thisButton.parent().parent();

                    itemsToUndo.items = [];
                    itemsToUndo.undoFrom = "removeDeck";

                    Workspaces.forEach(
                        function(item, index)
                        {
                            if(theWorkspace.text() == item.fileName)
                            {
                                itemsToUndo.items.push(index);
                                itemsToUndo.items.push(item);
                                Workspaces.splice(index, 1);
                                return
                            }
                        }
                    );
                    
                    itemsToUndo.items.push(theWorkspace);
                    itemsToUndo.items.push(theWorkspace.prev());
                    itemsToUndo.items.push(theWorkspace.next());
                    $("#package-navbar .undo-button").removeClass("inactive");

                    theWorkspace.detach();
                }
            );

            $(".deck-to-view-options").append( $("<option></option>").attr({"class": "decks-options mask_" + num}).text(newWorspacename) );
    
            Workspaces.push(
                {
                    fileName: newWorspacename,
                    exportAs: videoFound ? "Powerpoint(.pptx)" : "",
                    type: videoFound ? "powerpoint" : "any",
                    fileContents: collectionChildren,
                    tags: []
                }
            );

            // Mini-collection of items
            // On click, should display items on single deck view by default
            // Using unbind because without it, event happens multiple times
            $(".theWorkspaces").unbind('click').bind('click',
                function()
                {
                    // Change to single view mode
                    $('#select-number-of-decks').val('1 deck');
                    $('#select-number-of-decks').trigger('change');

                    // Trigger the dropdown to display needed contents
                    $("#single-mode .workspace-bottom-navbar .deck-to-view-options").val($(this).text());
                    $("#single-mode .workspace-bottom-navbar .deck-to-view-options").trigger('change');

                    // On click handler for cancel button
                    // Remove file when button clicked
                    $(".cancelBtn").unbind('click').bind('click', workspaceUndo);
                }
            );
        }
    });

    // setting the select all functionality
    $("#select-all-pages").click(
        function()
        {
            if(document.getElementById('select-all-pages').checked)
            {
                $("#filePreviewGrid .pageDisplayItem").addClass("pageSelected");
                $(".tickPage").prop("checked", true);
            }
            else
            {
                $("#filePreviewGrid .pageDisplayItem").removeClass("pageSelected");
                $(".tickPage").prop("checked", false);
            }
        }
    );

    $(".numberRanges").on('keyup', 
        function (e) 
        {
            e = e || window.event;

            if (e.key === 'Enter' || e.keyCode === 13)
            {
                var minValue = parseInt($("#minPageToSelect").val());
                var maxValue = parseInt($("#maxPageToSelect").val());

                if(minValue < 1)
                    alert("Minimum page number should be 1");
                else if(maxValue < 1)
                    alert("Maximum page number cannot be less than 1");
                else if(minValue > maxValue)
                    alert("Minimun cannot be larger than the Maximum");
                else if( minValue <= maxValue )
                {
                    for(let i = minValue - 1; i < maxValue; i++)
                    {
                        if(!$(".tickPage:eq(" + i + ")").prop("checked"))
                            $(".tickPage:eq(" + i + ")").prop("checked", true).trigger('click');
                    }
                }
            }
            else if(e.key == "ArrowLeft" || e.key == "ArrowRight" || e.keyCode == 37 || e.keyCode == 39 || e.key == "Left" || e.key == "Right")
            {
                if($("#minPageToSelect").is(":focus"))
                    $("#maxPageToSelect").focus();

                else
                    $("#minPageToSelect").focus();
            }
        }
    );

    // setting the list view(default) functionality
    $("#list-view").click(
        function()
        {
            $(this).addClass("unclickable");
            document.getElementById('gallery-view').checked = false;
            $("#gallery-view").removeClass("unclickable");

            $("#filePreviewContainer").removeClass("Gallery-view-mode");
            $("#filePreviewContainer").addClass("List-view-mode");

            $("#PagePreviewGrid, #PagesListContainer").hide();
            $("#filePreviewGrid").show();
        }
    );

    // setting the list view(default) functionality
    $("#gallery-view").click(
        function()
        {
            $(this).addClass("unclickable");
            document.getElementById('list-view').checked = false;
            $("#list-view").removeClass("unclickable");

            $("#filePreviewContainer").removeClass("List-view-mode");
            $("#filePreviewContainer").addClass("Gallery-view-mode");

            $("#filePreviewGrid").hide();
            $("#PagePreviewGrid, #PagesListContainer").show();

            if(firstTimeGalleryView)
            {
                $("#PagesListContainer").addClass("position-relative");
                var pages = $("#PagesListContainer").children();

                for(let hj = 0; hj < pages.length; hj++)
                    pagesOffsets["page_"+ (hj+1)] = pages[hj].offsetLeft;

                firstTimeGalleryView = false;
                scrollAmount = 0;
                $("#PagesListContainer").removeClass("position-relative");
            }
        }
    );

    var pressedDown_1 = false;

    $("#download-collection").on('mousedown',
        function()
        {
            $(this).addClass("pressed");
            pressedDown_1 = true;
        }    
    )
    
    $("#download-collection").on('mouseleave',
        function()
        {
            if(pressedDown_1)
            {
                $(this).removeClass("pressed");
                pressedDown_1 = false;
            }
        }    
    )

    // The Download collection button
    // On click, should submit Collection content to the back end
    $("#download-collection").on('mouseup', () =>
        {
            $("#download-collection").removeClass("pressed");

            if(Workspaces.length == 0)
            {
                console.log("Nothing to download, Collection is empty...");
                alert("Nothing to download, Collection is empty...");
            }
            else
            {
                var theWorkspaces = JSON.parse(JSON.stringify(Workspaces));

                theWorkspaces.forEach(
                    function(item)
                    {
                        delete item.type;
                        delete item.tags;
                        item.fileContents.forEach(
                            function(itm)
                            {
                                delete itm.imageData;
                            }
                        );
                    }
                );

                var urlToPost = "api/collections";
                var dataToPost = {
                    name: $("#deckName-written").text(),
                    files: theWorkspaces
                };

                $.ajax({
                    type: 'POST',
                    url: urlToPost,
                    data: JSON.stringify(dataToPost),
                    error: function(e) {
                        console.log(e);
                    },
                    dataType: "json",
                    contentType: "application/json"
                }).then(checkForPowerpoint).catch(checkForPowerpoint);

                console.log(JSON.stringify(dataToPost));

                function checkForPowerpoint()
                {
                    Workspaces.forEach( (item) =>
                        {
                            let file = item;
                            if(file.exportAs == "Powerpoint(.pptx)")
                            {
                                let exportPresentation = new PptxGenJS();

                                file.fileContents.forEach( (itm) => 
                                { 
                                    var theSlide = exportPresentation.addSlide();

                                    if(itm.pageNumber.includes("mp4"))
                                    {
                                        var videoPath = itm.imageData.substring(0, itm.imageData.indexOf("-thisIsVideo")) == "" ? 
                                                        itm.imageData : itm.imageData.substring(0, itm.imageData.indexOf("-thisIsVideo"));

                                        var masker = Object.keys(fileMasker).find(key => fileMasker[key] === videoPath.split("/")[1]);

                                        var fakeCanvas = document.getElementById("canv-"+masker);
                                        
                                        theSlide.addMedia({ type: "video", path: videoPath, cover: fakeCanvas.toDataURL("image/png"),
                                                            x: '25%', y: '2.5%', w: '50%', h: '90%'});

                                    }
                                    else
                                    {
                                        theSlide.addImage({ path: itm.imageData, x: '25%', y: '2.5%', w: '50%', h: '95%'})
                                    }
                                });

                                var exportData = {
                                    file_name: file.fileName,
                                    collection_name: dataToPost.name
                                };
                                
                                exportPresentation.writeFile({  fileName:  file.fileName}).then(
                                    function()
                                    {
                                        console.log("Done exporting powerpoint file...");

                                        setTimeout(
                                            function()
                                            {

                                                $.ajax({
                                                    type: 'POST',
                                                    url: "api/exportppt",
                                                    data: JSON.stringify(exportData),
                                                    error: function(e) {
                                                        console.log(e);
                                                    },
                                                    dataType: "json",
                                                    contentType: "application/json"
                                                }).catch(() => { console.log("The export POST request failed...")});

                                            }, 10000);
                                    }
                                );
                            }
                        }
                    );  
                    alert("Collection created successfully...");                     
                }
            }
        }
    );
    
}

function getIsDone(fileArray, theFiles, fileMasker)
{
    $(window).on('load', mainThread(fileArray, theFiles, fileMasker));
}

function printData(fileArray)
{
    console.log(fileArray);
    var theFiles = {};
    var fileMasker = {};
    // Loop through and display all results
    fileArray.forEach(
        function(item, index)
        {
            fileMasker["mask_" + index] = item.file_name;

            theFiles["mask_" + index] = [];
        }
    );
    getIsDone(fileArray, theFiles, fileMasker);
}

$(document).ready(
    function()
    {
        $.get( "api/files", function(data, status) { printData(data.files); });
    }
);















// Code for Sorting items by file type, needs to be revisited
// This functionality is not needed at the moment and I'm just too lazy to modify it rn

/*
    // Button in the naviigation bar of the Collection Grid
    // On click, filters items by file format and shows whole list of different formats as decks(mini-collections)
    $("#split-to-decks").on('click',
    function()
    {
        $(this).hide();
        $("#collectionViewer, #add-to-workspace").hide();
        $('#select-number-of-decks').val('Full list');
        $('#select-number-of-decks').trigger('change');
        $("#innerDecksViewer, #create-new-workspace, #revert-to-original, #viewMode-label, #select-number-of-decks").show();

        file_formats = {};
        var collectionChildren = $("#collectionViewer").children();

        // Loop through the children and sort them into their respective file format array
        for(let i = 0; i < collectionChildren.length; i++)
        {
            if(collectionChildren[i].classList.contains('type-pdf'))
            {
                if(file_formats.pdf == null)
                {
                    file_formats.pdf = [];
                    file_formats.pdf.push(collectionChildren[i]);
                }
                else
                {
                    file_formats.pdf.push(collectionChildren[i]);
                }
            }
            // More else if statements will come in here for other file types
        }

        // Loop through file_formats and create a mini-deck for every format
        for(let j in file_formats)
        {
            $("#full-mode").append( $("<div></div>").attr({"id": j+"-format", "class": "theFormats"}).text(j) );                  
        }

        // Mini-collection of items(sorted by file type)
        // On click, should display items on single deck view by default
        $(".theFormats").on('click',
        function()
        {
            $('#select-number-of-decks').val('1 deck');
            $('#select-number-of-decks').trigger('change');

            var deckId = $(this).attr("id");
            file_formats[deckId.slice(0,deckId.indexOf('-'))].forEach(
                function(item)
                {
                    let theItem = document.querySelector('#'+item.getAttribute("id"));
                    let clonedItem = theItem.cloneNode(true); 
                    clonedItem.classList.add("clones");
                    document.getElementById("single-mode").firstChild.appendChild(clonedItem);
                }
            );


            // On click handler for cancel button
            // Remove file when button clicked
            $(".cancelBtn").on('click',
                function()
                {
                    $(this).parent().parent().detach();
                }
            );
        });
    });


    // Revert back to original collection Viewer button
    // On click, 
    $("#revert-to-original").on('click',
    function()
    {
        $("#full-mode").empty();
        $(".workspace-displayer").empty();
        $(this).hide();
        $("#viewMode-label, #select-number-of-decks, #innerDecksViewer, #create-new-workspace").hide();
        $("#split-to-decks, #add-to-workspace, #collectionViewer").show();
    });
*/
