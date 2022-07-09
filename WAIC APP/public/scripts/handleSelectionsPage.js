/** Handles all front-end actions
 * @param {Array.<Object>} originalArray The list of files in the chosen directory, received from the server
 * @param {Object} filesArray An object containing the files' generated keys as the property, and array of strings[imagedata] as value
 * @param {Object} fileMasker An object containing the files' generated keys as the property, and the file name that the key maps to, as the value
*/
function mainThread(originalArray, filesArray, fileMasker)
{
    /**
     * Array of promises that try to render the files
     * @type {Array.<(Promise)>}
     */
    var filePromises = [];
    /**
     * Promise containing the file trying to be rendered currently
     * @type {Promise}
     */
    var PDF_DOC;
    /**
     * Total number of pages in the file
     * @type {Number}
     */
    var TOTAL_PAGES;
    /**
     * String that contains the characters typed in the search field, by the user
     * @type {String}
     */
    var matcher;
    /**
     * Records the first time gallery view was opened(Inorder to get initial offset of elements)
     * @type {Boolean}
     */
    var firstTimeGalleryView = true;
    /**
     * Stores the amount of pixels scrolled
     * @type {Number}
     */
    var scrollAmount;
   
    /**
     * An object containing file generated keys as the property, and file name that the key maps to as value,
     * similar to "fileMasker" but this one is for the files generated inside the colection
     * @type {Object}
     */
    var fileMasker_1 = {};

    // Append a container that will hold canvases to temporarily render first pages of the files and get image data
    $("body").append(
        $("<div></div>").attr({"id": "cover-pages-container"})
    );

    // Loop through the list of files and displaying them using their first pages as cover page
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

        // If the file being rendered is a pdf, first page of the file gets rendered on temporary invisible canvas
        if( theExtension.toLowerCase() == "pdf")
        {
            $("#cover-pages-container").append(
                $("<canvas></canvas>").attr({"id": "cover-page-"+(index+1), "class": "mask_"+index, "width": "400"}).css("display","none")
            );
            displayFiles(item, index, item.substring(0, item.indexOf(theExtension) - 1), theExtension, "#cover-page-"+(index+1));
        }
        else if(theExtension.toLowerCase() == "png" || theExtension.toLowerCase() == "jpg" || theExtension.toLowerCase() == "mp4")
        {
            displayFiles(item, index, item.substring(0, item.indexOf(theExtension) - 1), theExtension, "#file-"+(index+1));
        }
    }

    // Wait for all first pages of files to finish rendering
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
            console.log(e.message + " , at least one of the files could not be rendered");
            doneLoading();
        }
    );

    // Setting the on click handler for the File element
    $(".search-result").on('click', fileClick);

    /**
     * Function that initiates loading
    */
    function setLoading()
    {
        // Make the root container unclickable and faded
        $("#root-container").addClass("loading-opacity");
        // Display the loader container
        $("#load-wrapper").show();
    }

    /**
     * Function that completes loading
    */
    function doneLoading()
    {
        // Hide the loader container
        $("#load-wrapper").fadeOut("slow");
        // Restore the root container
        $("#root-container").removeClass("loading-opacity");
    }

    /**
     * Function that handles when remove button is pressed on the items in a workspace(file inside collection)
     * @params Event eventObject:  The clicked item event
    */
    function workspaceUndo()
    {
        // Getting the display that the element is found in
        var theWorkspaceDisplay = $(this).parent().parent().parent();

        // Deactivating the undo button on the giver display, 
        // Only if the most recent action of this current display was receiving a ui-sortable  element from giver display
        if(theWorkspaceDisplay.hasClass("theReceiver"))
        {
            if((wpActions[$(".theGiver").parent().attr("id")] != null) && wpActions[$(".theGiver").parent().attr("id")].undoFrom == "sorting-external")
            {
                if(wpActions[$(".theGiver").parent().attr("id")].fromCancel == false)
                    $(".theGiver").prev().find(".undo-button").addClass("inactive").prop("disabled", true);
            }
        }
        
        // Deactivating the undo button on the receiver display, 
        // Only if the most recent action of this current display was giving out a ui-sortable  element to receiver display
        else if(theWorkspaceDisplay.hasClass("theGiver"))
        {
            if((wpActions[$(".theReceiver").parent().attr("id")] != null) && wpActions[$(".theReceiver").parent().attr("id")].undoFrom == "sorting-external")
            {
                if(wpActions[$(".theReceiver").parent().attr("id")].fromCancel == false)
                    $(".theReceiver").prev().find(".undo-button").addClass("inactive").prop("disabled", true);
            }
        }
        // Make the previous temporarily hidden element, permanently hidden
        theWorkspaceDisplay.find(".temporarily-hidden").addClass("permanently-hidden");
        // Remove the temporarily hidden class from the permanently hidden items
        theWorkspaceDisplay.find(".permanently-hidden").removeClass("temporarily-hidden");

        itemsToUndo_2.undoFrom = "cancel";

        // Resetting this display's undoFrom property 
        if(itemsToUndo_3[theWorkspaceDisplay.parent().attr("id")] != null)
            itemsToUndo_3[theWorkspaceDisplay.parent().attr("id")].undoFrom = "";

        if(theWorkspaceDisplay.parent().attr("id") != "single-mode")
            wpActions[theWorkspaceDisplay.parent().attr("id")] = { items: [], undoFrom: "", fromCancel: true};

        $(this).parent().parent().addClass("temporarily-hidden");

        // Activate this display's undo and save button
        theWorkspaceDisplay.prev().find(".undo-button, .save-deck").removeClass("inactive").prop("disabled", false);
    }

    /**
     * Handles the page clicking event, It highlights the page clicked
     * @params Event eventObject:  The clicked item event
    */
    function pageClick()
    {
        var thisPage = $(this);

        thisPage.toggleClass("pageSelected");
        var idNum = thisPage.attr("id").split('-')[1];

        // Selecting or Deselecting it's corresponding page inside Gallery view
        if(thisPage.hasClass("pageSelected"))
            $("#page_"+idNum).parent().next().children()[0].checked = true;
        else
            $("#page_"+idNum).parent().next().children()[0].checked = false;

        // If select-all was active, clicking a page deactivates select-all
        if(document.getElementById('select-all-pages').checked)
            document.getElementById('select-all-pages').checked = false;

        // If after clicking this page, all pages are now selected, then activate select-all
        else if($("#filePreviewGrid .pageDisplayItem").length == $(".pageSelected").length)
            document.getElementById('select-all-pages').checked = true;
    }

    /**
     * Handles the gallery-view page clicking event, It highlights the page and brings it into the single view
     * @params Event eventObject:  The clicked item event
     */
    function galleryPageClick()
    {
        var thisPage = $(this);

        // Removes this class from all other elements, to leave only this selected item 
        $(".galleryPageSelected").removeClass("galleryPageSelected");
        thisPage.toggleClass("galleryPageSelected");

        // Both the next and previous buttons are hidden then bring them into view
        if((window.getComputedStyle($("#prevbtn-container")[0]).display == window.getComputedStyle($("#nextbtn-container")[0]).display) && (window.getComputedStyle($("#prevbtn-container")[0]).display == "none"))
            $("#prevbtn-container, #nextbtn-container").show();

        // Remove all previous contents of the preview container and append the current page clicked
        $("#PagePreviewContainer").empty();
        $("#PagePreviewContainer").append(
            $("<img>").attr({"src": thisPage.find(".PagePreviewed").attr("src"), "class": "singlePage "+thisPage.children(":first").attr("id")})
        );

        // If this page is the first, hide the "previous button" otherwise show it
        if($("#page_" +(parseInt(thisPage.find(".PagePreviewed").attr("id").split('_')[1]) - 1)).length == 0)
            $("#prevbtn-container").hide();
        else
            $("#prevbtn-container").show();

        // If this page is the last, hide the "next button" otherwise show it
        if($("#page_" +(parseInt(thisPage.find(".PagePreviewed").attr("id").split('_')[1]) + 1)).length == 0)
            $("#nextbtn-container").hide();
        else
            $("#nextbtn-container").show();
    }

    /**
     * Displays all pages from the file using the image data of the pages
     * @param {String} file_name The file name
     * @param {Array.String} pagesArray Array of image data of each page
     */
    function displayPagesFromData(file_name, pagesArray)
    {
        // Getting the key that maps to this file name given
        var theMask = Object.keys(fileMasker).find(key => fileMasker[key] === file_name);

        // Looping through the array of pages and displaying the page data
        pagesArray.forEach(
            function(item, index)
            {
                // Appending the page element to the Preview Grid in List View
                $("#filePreviewGrid").append(
                    $("<div></div>").attr({"id": theMask+"-"+ (index+1), "class": "pageDisplayItem"}).append(
                        $("<img>").attr({"src": item, "id": "page-"+ (index+1), "class": "filePagePreviewed"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(index+1)
                    )    
                );
                // Appending the page element to the Preview List in Gallery View
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
        
        // On click handling for gallery view checkbox
        $(".tickPage").unbind('click').bind('click',
            function()
            { 
                var idNum = $(this).parent().prev().find(".PagePreviewed").attr("id").split("_")[1];
                // Trigger the click to it's corresponding page in the List view
                $("#page-"+idNum).parent().trigger('click');
            }
        );

        // On click handling when a List-view page is clicked 
        $("#filePreviewGrid .pageDisplayItem").on('click', pageClick);

        // On click handling when a Gallery-view page is clicked
        $(".pageDisplayItem-1").on('click', galleryPageClick);

        // Gallery-view mode is active, trigger it's handler
        if(document.getElementById("gallery-view").checked)
            $("#gallery-view").trigger('click');
    }

    /**
     * Contains the page elements' id, as the properties and their offsets from parent div as the values
     * @type {Object}
     */
    var pagesOffsets = {};

    /**
     * Handles the file click event, It highlights the file clicked and displays it's pages on the previewer
     * @params Event eventObject:  The clicked item event
     */
    function fileClick()
    {
        var thisFile = $(this);
        firstTimeGalleryView = true;
        pagesOffsets = {};
        // Resetting the scroll position
        $("#PagesListContainer")[0].scrollLeft = 0;
        // Clear the viewer Grids
        $("#filePreviewGrid, #PagePreviewContainer, #PagesListContainer").empty();

        // Hide all currently un-needed items from display
        $("#select-all-pages, #select-all-pages-label, #list-view, #list-view-label, #gallery-view, #gallery-view-label").hide();
        $("#prevbtn-container, #nextbtn-container").hide();
        $("#select-multiple, .numberRanges-labels, .numberRanges").hide();
        thisFile.toggleClass("fileSelected");

        if(thisFile.hasClass("fileSelected"))
        {
            var masker = "mask_"+(parseInt(thisFile.attr("id").split('-')[1]) - 1);
            // Retrieving the file name 
            var nameOfFile = fileMasker[masker];
            //nameOfFile = nameOfFile.replace("&amp;","&");

            var fileExtension = nameOfFile.split('.')[nameOfFile.split('.').length - 1];

            // remove selected from all other file items, to leave "this" as the only one selected
            $(".search-result").removeClass("fileSelected");
            thisFile.addClass("fileSelected");

            if(fileExtension.toLowerCase() === "mp4")
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
            else if(fileExtension.toLowerCase() == "png" || fileExtension.toLowerCase() == "jpg")
            {
                if(document.getElementById("gallery-view").checked)
                    $("#list-view").trigger('click');
                    
                $("#filePreviewGrid").removeClass("videoOnDisplay");
                $("#filePreviewGrid").removeClass("fileOnDisplay");
                $("#filePreviewGrid").addClass("imageOnDisplay");
                $("#filePreviewGrid").append( $("<img>").attr({"id": masker, "src": "files/"+ nameOfFile, "class": "image-file"}));
            }
            else if( fileExtension.toLowerCase() === "pdf" )
            {
                document.getElementById("select-all-pages").checked = false;
                
                // Unhide the necessary items
                $("#select-all-pages, #select-all-pages-label, #list-view, #list-view-label, #gallery-view, #gallery-view-label").show();
                $("#select-multiple, .numberRanges-labels, .numberRanges").show();
                setLoading();                    
                $("#filePreviewGrid").removeClass("videoOnDisplay");
                $("#filePreviewGrid").removeClass("imageOnDisplay");
                $("#filePreviewGrid").addClass("fileOnDisplay");

                // If the array has more than 1 items then use pdf.js to render the file pages
                if(filesArray[masker].length < 2)
                {
                    showAllPagesFromPdf("files/" + nameOfFile, nameOfFile);
                }
                // Otherwise, the pages have already been rendered, thus display them from the image data stored
                else
                {
                    displayPagesFromData(nameOfFile, filesArray[masker]);
                    doneLoading();
                }
            }                
        }  
    }


    /**
     * Displays the first page of file as the file's cover page
     * @param {String} item The full file name
     * @param {Number} index The index number of the file
     * @param {String} filename The name of the file without its extension
     * @param {String} itsExtension The file extension
     * @param {Number} idToRender The id of the element to render the file cover page on
     */
    function displayFiles(item, index, filename, itsExtension, idToRender)
    {
        if(itsExtension.toLowerCase() == "mp4")
        {
            document.getElementById("file-"+(index+1)).outerHTML = "<video id=\"file-" + (index+1) + "\"></video>";
            
            $("#file-"+(index+1)).attr({"src": "files/"+item, "class": "result-file"});
            
        }
        else if(itsExtension.toLowerCase() == "png" || itsExtension.toLowerCase() == "jpg")
        {
            document.getElementById("file-"+(index+1)).outerHTML = "<img id=\"file-" + (index+1) + "\">";
            
            $("#file-"+(index+1)).attr({"src": "files/"+item, "class": "result-file"});
        }
        // Need to figure out how to display ppt, maybe just convert ppt to pdf on back-end
        else if( itsExtension.toLowerCase() == "pptx")
        {
            
        }
        else
        {
            var masker = Object.keys(fileMasker).find(key => fileMasker[key] === item);
            filePromises.push(showPDF("files/" + item, idToRender, filename, filesArray[masker].length > 0));   
        }
    }


    /**
     * Gets the pdf document using pdf.js and loops to render all pages from the file
     * @param {String} pdf_url The url/source of the file
     * @param {String} file_name The name of the file
     */
    async function showAllPagesFromPdf(pdf_url, file_name)
    {
        // get handle of pdf document
        try
        {    
            PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });    
        }
        catch(error)
        {
            alert(error.message);
            doneLoading();
        }

        // total pages in pdf
        TOTAL_PAGES = PDF_DOC.numPages;

        /**
        * Array of promises that try to render a page
        * @type {Array.<(Promise)>}
        */
        var pagePromises = [];

        for(let i = 0; i < TOTAL_PAGES; i++)
        {
            // Using a temporary invisible canvas to render the page
            $("body").append(
                $("<canvas></canvas>").attr({"id": "canvasToRemove-"+i, "class": "canvases-to-remove", "width": "580"}).css("display", "none")
            );
            pagePromises.push(showPage(document.querySelector("#canvasToRemove-"+i), i+1));
        }

        // When all pages are done being rendered, get their image data and display the pages using the images
        Promise.all(pagePromises).then(
            function()
            {
                var masker = Object.keys(fileMasker).find(key => fileMasker[key] === file_name);
                filesArray[masker] = [];
                for(let kh = 0; kh < TOTAL_PAGES; kh++)
                {
                    // Storing the image data from canvas
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

                // On click handling for gallery view checkbox
                $(".tickPage").unbind('click').bind('click',
                    function()
                    { 
                        var idNum = $(this).parent().prev().find(".PagePreviewed").attr("id").split("_")[1];
                        // Trigger the click to it's corresponding page in the List view
                        $("#page-"+idNum).parent().trigger('click');
                    }
                );

                // On click handling when a List-view page is clicked
                $("#filePreviewGrid .pageDisplayItem").on('click', pageClick);
                
                // On click handling when a Gallery-view page is clicked
                $(".pageDisplayItem-1").on('click', galleryPageClick);

                // Gallery view is active, trigger it's handler
                if(document.getElementById("gallery-view").checked)
                    $("#gallery-view").trigger('click');
                
                doneLoading();
            }
        ).catch(doneLoading);
    }


    /**
     * Displays the first page as the cover page for the file
     * @param {String} pdf_url The url/source of the file
     * @param {Number} fileID The id of the element to be rendered on
     * @param {String} fileName The name of the file
     * @param {Boolean} hasImage States whether the file has been rendered yet
     * @returns {Promise} Promise object, obtained from "showPage" function 
     */
    async function showPDF(pdf_url, fileID, fileName, hasImage)
    {
        // If the file has been rendered before, display it using image data stored
        if(hasImage)
        {
            var masker = Object.keys(fileMasker).find(key => fileMasker[key] === fileName+".pdf");
            $(fileID).attr("src", filesArray[masker][0]);
        }
        // Otherwise render the file
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


    /**
     * Renders the page number given, onto the canvas passed
     * @param {Node} _CANVAS The canvas element to render on
     * @param {Number} page_no The page number to render
     * @returns {Promise} Promise object, resolves when page is rendered
     */
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


    /**
     * Determines whether the last modified date matches
     * @param {String} fileNameGiven The name of the file
     * @returns Boolean that states if there is a match
     */
    function matchLastModTag(fileNameGiven)
    {
        /**
         * Getting the match condition chosen by User
         * @type {String}
         */
        var LastModValue = $("#lastMod-tag").val();

        if(LastModValue == "Last Modified")
        {
            return true;
        }
        else
        {
            var theCondition = false;

            // Looking for the file and it's last modified content from Original array
            originalArray.forEach(
                function(item)
                {
                    if(item.file_name == fileNameGiven)
                    {
                        // Getting the current day's date
                        var today = new Date();
                        var todayDate = today.getDate();
                        // Month is 0 indexed
                        var todayMonth = today.getMonth() + 1;
                        var todayYear = today.getFullYear();

                        /**
                         * Contains the last modified data of the file
                         * @type {Object}
                         * @property {String} date - The Date the file was modified
                         * @property {String} month - The month the file was modified
                         * @property {String} year - The year the file was modified
                         */
                        var lastModObject = item.last_modified;

                        if(LastModValue == "within the last day")
                        {
                            var previous = new Date();
                            previous.setDate(todayDate - 1);
                            
                            // If the dates are the same, checking if month and year match
                            if(lastModObject.date == todayDate)
                                theCondition = (lastModObject.month == todayMonth) && (lastModObject.year == todayYear);
                            // If file's modified date matches previous date, checking if month and year match
                            else if(lastModObject.date == previous.getDate())
                                theCondition = (lastModObject.month == previous.getMonth() + 1) && (lastModObject.year == previous.getFullYear());
                        }
                        else if(LastModValue == "within the last week")
                        {
                            var previous = new Date();
                            previous.setDate(todayDate - 7);

                            // If file's modified month is within range, checking if year matches and date is within range
                            if(lastModObject.month == previous.getMonth()+ 1)
                                theCondition = (lastModObject.date >=  previous.getDate()) && (lastModObject.year == previous.getFullYear());
                            
                            else if (lastModObject.month == todayMonth)
                                theCondition = (lastModObject.date <=  todayDate) && (lastModObject.year == previous.getFullYear());

                        }
                        else if(LastModValue == "within the last month")                      
                        {
                            var previous = new Date();
                            previous.setMonth(todayMonth - 2);
                            
                            // If file's modified month is within range, checking if year matches and date is within range
                            if(lastModObject.month == previous.getMonth()+ 1)
                                theCondition = (lastModObject.date >=  previous.getDate()) && (lastModObject.year == previous.getFullYear());
                            
                            else if (lastModObject.month == todayMonth)
                                theCondition = (lastModObject.date <=  todayDate) && (lastModObject.year == previous.getFullYear());
                            
                        }
                        else if(LastModValue == "within the last 6 months")
                        {
                            var previous = new Date();
                            previous.setMonth(todayMonth - 7);
                            
                            // If 6 months back, falls into the previous year
                            if(previous.getFullYear() == todayYear - 1)
                            {
                                // If the file's modified year is the previous year
                                if(lastModObject.year == previous.getFullYear())
                                {
                                    // If the file's modified month is within the 6 months range, condition is true
                                    if(lastModObject.month > previous.getMonth() + 1)
                                        theCondition = true;
                                    // Otherwise checking that the date is within range 
                                    else if(lastModObject.month == previous.getMonth() + 1)
                                        theCondition = lastModObject.date >=  previous.getDate();
                                }
                                else if(lastModObject.year == todayYear)
                                {
                                    // If the file's modified month is within the 6 months range, condition is true
                                    if(lastModObject.month < todayMonth)
                                        theCondition = true;
                                    // Otherwise checking that the date is within range
                                    else if(lastModObject.month == todayMonth)
                                        theCondition = lastModObject.date <=  previous.getDate();
                                }
                            }
                            else
                            {
                                // If the file's modified month is within the 6 months range, condition is true
                                if((lastModObject.month > previous.getMonth() + 1) && lastModObject.month < todayMonth)
                                    theCondition = true;
                                // Otherwise checking that the date is within range
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
                            
                            // If the file's modified year is the previous year
                            if(lastModObject.year == previous.getFullYear())
                            {
                                // If the file's modified month is within the 12 months range, condition is true
                                if(lastModObject.month > previous.getMonth() + 1)
                                    theCondition = true;
                                // Otherwise checking that the date is within range
                                else if(lastModObject.month == previous.getMonth() + 1)
                                    theCondition = lastModObject.date >=  previous.getDate();
                            }
                            else if(lastModObject.year == todayYear)
                            {
                                // If the file's modified month is within the 12 months range, condition is true
                                if(lastModObject.month < todayMonth)
                                    theCondition = true;
                                // Otherwise checking that the date is within range
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

    
    /**
     * Determines whether the extensions match
     * @param {String} extension 
     * @returns Boolean that states if there is a match
     */
    function matchFileTypeTag(extension)
    {
        /**
         * Getting the match condition chosen by User
         * @type {String}
         */
        var fileTagValue = $("#fileType-tag").val();

        if(fileTagValue == "File Type")
        {
            return true;
        }
        else
        {
            var extFromTag = fileTagValue.substring(fileTagValue.indexOf("(")+2).replace(")", "");

            if(fileTagValue.includes("jpg/png"))
                return extFromTag.split("/")[0] == extension.toLowerCase() || extFromTag.split("/")[1] == extension.toLowerCase();
            else
                return extFromTag == extension.toLowerCase();
        }
    }


    /**
     * Determines whether the item to be filtered passes the match conditions
     * @param {String} item The file name key passed from the array
     * @returns Boolean that states if there is a match
     */
    function checkMatchWithInput(item)
    {
        // Getting the file name
        var unmasked = fileMasker[item];
        fileNameArray = unmasked.split(".");
        
        // User might have dots in their file name
        var itsExtension = fileNameArray[fileNameArray.length - 1];
        
        var filename = unmasked.substring(0, unmasked.indexOf(itsExtension) - 1)
        
        return  matchLastModTag(unmasked) && matchFileTypeTag(itsExtension) && filename.toLowerCase().includes(matcher.toLowerCase());
    }

    
    /**
     * Filters the file array according to the value from the input search field
     * @param {Event} e - The event object passed from the input field
     */
    function filterValues(e)
    {
        // Getting the value typed
        matcher = e.target.value;

        // Array containing the filtered keys
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
            }
        );

        $(".search-result").unbind('click').bind('click', fileClick);

        Promise.all(filePromises).then(doneLoading).catch(
            function()
            {
                alert("At least one of the files could not be rendered");
                doneLoading();
            }
        );  
    }

    /**
     * The search field input element
     * @type {Node}
     */
    var searchField = document.querySelector("#search-field-2");
    
    searchField.addEventListener('input', filterValues);

    // On change handling for the filter dropdowns
    $("#fileType-tag, #lastMod-tag").change(
        function()
        {
            const event = new Event('input');  
            searchField.dispatchEvent(event);
        }
    );

    /**
     * Holds the item and which action to undo
     * @type {Object}
     * @property {String} undoFrom - Determines action to undo 
     * @property {Array} items - Stores item to undo, its initial position, and reference elements
     */
    var itemsToUndo = {
        undoFrom: "",
        items: []
    };

    $("#package-navbar .undo-button").css("margin", "0px 8px 0px 8px").show();

    // Handling when Enter key is pressed inside the name edit field
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
            $("#done-edit, #deckName").show();   
        }
    );
    // Click handler for done editing button
    $("#done-edit").on('click',
        function()
        {
            $(this).hide();
            $("#deckName").hide();
            $("#deckName-written").text($("#deckName").val());
            $("#pencil-edit, #deckName-written").show();
        }
    );

    
    /**
     * @type {Array.<{fileName: String, exportAs: String, fileContents: String[], type: String, tags: String[]}>} :- Global list of objects(workspace and their contents)
     */
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

    // On click handling for pressing Enter after finishing name editing in a workspace
    $(".workspace-name").on('keyup', 
        function (e) 
        {
            if (e.key === 'Enter' || e.keyCode === 13)
                $(this).parent().find(".done-edit").trigger('click');
        }
    );

    // Click handler for the pencil edit  in a workspace
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

    // Click handler for the done edit  in a workspace
    $(".done-edit").on('click',
        function()
        {
            $(this).hide();
            $(this).next().next().hide();
            $(this).next().text($(this).next().next().val());
            $(this).parent().find(".save-deck").show();
            $(this).parent().find(".save-deck").removeClass("inactive").prop("disabled", false);
            $(this).prev().show();
            $(this).next().show();
        }
    );

    // On click handling for the previous button, in Gallery-view mode
    $("#prevbtn-container").click(
        function()
        {
            // If the next button was hidden, display it
            if(window.getComputedStyle($("#nextbtn-container")[0]).display == "none")
                $("#nextbtn-container").show();

            // The page previously on view
            var theSinglePage = $(".singlePage");

            theSinglePage.animate(
                {
                    left: "50px",
                    opacity: "0"
                },
            "slow");
            
            // The future page after this currently page gets displayed
            var nextSinglePage;
            setTimeout( 
                function() 
                {
                    // The page currently coming into view
                    var nextPage = $("#page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) - 1));
                    var nextPageOffset = pagesOffsets[("page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) - 1))];

                    var pagesList = $("#PagesListContainer")[0];

                    // Procedure to scroll the currently highlighted page into view
                    // Uses difference between the initial offsets and the container offset
                    var offsetDifference = nextPageOffset - scrollAmount;
                    if(offsetDifference < 10)
                    {
                        offsetDifference = offsetDifference * (-1);
                        var quot = ~~((offsetDifference + 10)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft - (quot*105);
                    }
                    else if(offsetDifference > 480)
                    {
                        var quot = ~~((offsetDifference - 480)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft + (quot*105);
                    }

                    nextPage.parent().trigger('click');
                    nextSinglePage = $(".singlePage");
                    nextSinglePage.css({"opacity": "0"});
                    nextSinglePage.animate({ left: "-60px"},"fast");
                    nextSinglePage.animate({ left: "+=60px", opacity: "1"},"slow");
                    
                    // The future page is undefined, limit has been reached thus hide this button
                    if($("#page_" +(parseInt(nextPage.attr("id").split('_')[1]) - 1)).length == 0)
                        $("#prevbtn-container").hide();
                },
            200);
        }
    );

    // On click handling for the next button, in Gallery-view mode
    $("#nextbtn-container").click(
        function()
        {
            // If the previous button was hidden, display it
            if(window.getComputedStyle($("#prevbtn-container")[0]).display == "none")
                $("#prevbtn-container").show();

            // The page previously on view
            var theSinglePage = $(".singlePage");

            theSinglePage.animate(
                {
                    left: "-50px",
                    opacity: "0"
                },
            "slow");
            
            // The future page after this currently page gets displayed
            var nextSinglePage;
            setTimeout( 
                function() 
                {
                    // The page currently coming into view
                    var nextPage = $("#page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) + 1));
                    var nextPageOffset = pagesOffsets[("page_" + (parseInt(theSinglePage[0].classList[1].split('_')[1]) + 1))];

                    var pagesList = $("#PagesListContainer")[0];

                    // Procedure to scroll the currently highlighted page into view
                    // Uses difference between the initial offsets and the container offset
                    var offsetDifference = nextPageOffset - scrollAmount;
                    if(offsetDifference > 480)
                    {
                        var quot = ~~((offsetDifference - 480)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft + (quot*105);
                    }
                    else if(offsetDifference < 10)
                    {
                        offsetDifference = offsetDifference * (-1);
                        var quot = ~~((offsetDifference + 10)/100);
                        quot++;
                        pagesList.scrollLeft = pagesList.scrollLeft - (quot*105);
                    }

                    nextPage.parent().trigger('click');
                    nextSinglePage = $(".singlePage");
                    nextSinglePage.css({"opacity": "0"});
                    nextSinglePage.animate({ left: "60px"},"fast");
                    nextSinglePage.animate({ left: "-=60px", opacity: "1"},"slow");
                    
                    // The future page is undefined, limit has been reached thus hide this button
                    if($("#page_" +(parseInt(nextPage.attr("id").split('_')[1]) + 1)).length == 0)
                        $("#nextbtn-container").hide();
                },
            200);
        }
    );
    
    // Getting the amount scrolled 
    $("#PagesListContainer").on('scroll',
        function()
        {
            var pagesListContainer = $(this)[0];
            let x = pagesListContainer.scrollLeft;

            scrollAmount = x.toFixed();
        }
    );

    // Making the view container sortable
    $("#collectionViewer").sortable(
        {
            update: function(event, ui)
                    {
                        // Deactivate undo button when user sorts items
                        ui.item.parent().prev().find(".undo-button").addClass("inactive").prop("disabled", true);
                    }
        }
    );

    // On click handling for a workspace undo button
    $(".workspace-namer .undo-button").on('click',
        function()
        {
            var thisButton = $(this);
            // Activate Save button
            thisButton.parent().find(".save-deck").removeClass("inactive").prop("disabled", false);

            // If the most recent action was adding a page, remove the added pages
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

                // Object containing undo information of this current workspace
                var pack = wpActions[thisButton.parent().parent().attr("id")];

                // When in two/three-view mode
                if(pack != null)
                {
                    if(pack.undoFrom == "sorting-within" || pack.undoFrom == "sorting-external")
                    {
                        // If the sorted element was passed to a different workspace
                        if(pack.undoFrom == "sorting-external")
                        {
                            // If this workspace is the one that gave out the element
                            if(thisButton.parent().next().hasClass("theGiver"))
                            {
                                $(".theReceiver").children()[pack.items[3]].remove();
                                if(pack.items[0] == 0)
                                    thisButton.parent().next()[0].prepend(pack.items[1]);
                                
                                else
                                    pack.items[2].insertAdjacentElement("afterEnd", pack.items[1]);
                            }
                            // If this workspace is the one that received the element
                            else
                            {
                                thisButton.parent().next().children()[pack.items[3]].remove();
                                if(pack.items[0] == 0)
                                    $(".theGiver")[0].prepend(pack.items[1]);
                            
                                else
                                    pack.items[2].insertAdjacentElement("afterEnd", pack.items[1]);
                            }
                            // Deactivate undo from both the giver and the receiver workspaces
                            $(".theReceiver, .theGiver").prev().find(".undo-button").addClass("inactive").prop("disabled", true);
                        }
                        // Otherwise the sorted element was moved within the same workspace
                        else
                        {
                            thisButton.parent().next().children()[pack.items[3]].remove();
                            if(pack.items[0] == 0)
                                thisButton.parent().next()[0].prepend(pack.items[1]);
                    
                            else
                                pack.items[2].insertAdjacentElement("afterEnd", pack.items[1]);
                        }
                    }
                    // If the most recent action was removing a page
                    else if(pack.fromCancel)
                    {
                        thisButton.parent().next().find(".temporarily-hidden").removeClass("temporarily-hidden");
                        pack.fromCancel = false;
                    }   
                }
                // When in Single-view mode
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

            // Reset Undo information
            if(itemsToUndo_3[thisButton.parent().parent().attr("id")] != null)
                itemsToUndo_3[thisButton.parent().parent().attr("id")].undoFrom = "";

            // Deactivate this undo button        
            thisButton.addClass("inactive").prop("disabled", true);
        }
    );
    
    /**
     * Contains Undo information for single mode view
     * @type {Object}
     * @property {String} undoFrom - Determines action to undo
     * @property {Boolean} foreignFlag - Determines whether sorting was done within a workspace or between workspaces
     * @property {Array} items - Stores item to undo, its initial position, and reference elements
     */
    var itemsToUndo_2 = { undoFrom: "", foreignFlag: false, items: [] };
    /**
     * Holds undo information specifically when new pages are inserted into a workspace
     * @type {Object}
     */
    var itemsToUndo_3 = {};
    /**
     * Holds undo information specifically when sorting is done on the workspaces
     * @type {Object}
     */
    var wpActions = {}

    
    // Making the viewers sortable and connected to each to enable sort between
    $(".workspace-displayer").sortable(
        {
            connectWith: ".workspace-displayer",
            start: function(event, ui)
                    {
                        // When in two/three-view mode
                        if(ui.item.parent().parent().attr("id") != "single-mode")
                        {                            
                            $(".workspace-displayer").removeClass("temporaryGiver");
                            ui.item.parent().addClass("temporaryGiver");

                            // If the field exists then reset it's items
                            if(wpActions[ui.item.parent().parent().attr("id")] != null)
                                wpActions[ui.item.parent().parent().attr("id")].items = [];
                            //If the field doesn't exist, it is initialized  
                            else
                                wpActions[ui.item.parent().parent().attr("id")] = { items: [], undoFrom: "", fromCancel: false};
                            
                            var pack = wpActions[ui.item.parent().parent().attr("id")];
                            var undoList = pack.items;

                            itemsToUndo_2.foreignFlag = false;
                            undoList.push(ui.item.index());
                            undoList.push(ui.item[0]);
                            undoList.push(ui.item.prev()[0]);
                        }
                        // When in single-view mode
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
                        // Activating the save and undo button
                        ui.item.parent().prev().find(".save-deck, .undo-button").removeClass("inactive").prop("disabled", false);
                        
                        itemsToUndo_2.undoFrom = "sorting";
                        
                        // If the field is defined, reset its info
                        if(itemsToUndo_3[ui.item.parent().parent().attr("id")] != null)
                            itemsToUndo_3[ui.item.parent().parent().attr("id")].undoFrom = "";

                        // When in two/three-view mode
                        if(ui.item.parent().parent().attr("id") != "single-mode")
                        {
                            var theGiverPack = wpActions[$(".temporaryGiver").parent().attr("id")] || wpActions[$(".theGiver").parent().attr("id")];                            

                            // If sorting remained within the workspace
                            if(!itemsToUndo_2.foreignFlag)
                            {
                                theGiverPack.undoFrom = "sorting-within";
                                theGiverPack.items.push(ui.item.index());

                                // If this workspace gave an item to a neighbouring workspace, and changes are made in this workspace
                                // The receiver's undo button gets deactivated
                                if(ui.item.parent().hasClass("theGiver") && wpActions[$(".theReceiver").parent().attr("id")].undoFrom == "sorting-external")
                                    $(".theReceiver").prev().find(".undo-button").addClass("inactive").prop("disabled", true);

                                // If this workspace received an item from a neighbouring workspace, and changes are made in this workspace
                                // The giver's undo button gets deactivated
                                else if(ui.item.parent().hasClass("theReceiver") && wpActions[$(".theGiver").parent().attr("id")].undoFrom == "sorting-external")
                                    $(".theGiver").prev().find(".undo-button").addClass("inactive").prop("disabled", true);

                            }
                            else
                            {
                                // Initializing undo information
                                wpActions[ui.item.parent().parent().attr("id")] = { items: theGiverPack.items, undoFrom: "sorting-external", fromCancel: false };
                                
                                $(".workspace-displayer").removeClass("theGiver");
                                $(".temporaryGiver").addClass("theGiver")
                                $(".theGiver").removeClass("temporaryGiver");
                                
                                $(".workspace-displayer").removeClass("theReceiver");
                                ui.item.parent().addClass("theReceiver");

                                theGiverPack.undoFrom = "sorting-external";
                                
                                if(itemsToUndo_3[$(".theGiver").parent().attr("id")] != null)
                                    itemsToUndo_3[$(".theGiver").parent().attr("id")].undoFrom = "";

                                // Activating the giver's undo and save button
                                $(".theGiver").prev().find(".save-deck, .undo-button").removeClass("inactive").prop("disabled", false);

                                // Workspace that's not the giver or the receiver
                                var isolatedWorkspace = $(".workspace-displayer:not(.theGiver):not(.theReceiver):eq(1)");

                                // If the isolated workspace still remembers sorting externaly
                                // It's undo button is deactivated
                                if(wpActions[isolatedWorkspace.parent().attr("id")] != null)
                                {
                                    if(wpActions[isolatedWorkspace.parent().attr("id")].undoFrom == "sorting-external")
                                        isolatedWorkspace.prev().find(".undo-button").addClass("inactive").prop("disabled", true);
                                }
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

    // Handling on change for the export as dropdown
    $(".deck-to-export-options").change(
        function()
        {
            $(this).parent().prev().prev().find(".save-deck").removeClass("inactive").prop("disabled", false);
        }
    );


    // The Save button on a workspace viewer
    // When clicked it saves the content currently present
    $(".workspace-namer .save-deck").on('click',
        function()
        {
            setLoading();
            var thisButton = $(this);
            // Removing the hidden elements
            thisButton.parent().next().find(".temporarily-hidden, .permanently-hidden").detach();
            // Deactivating the undo button
            thisButton.parent().find(".undo-button").addClass("inactive").prop("disabled", true);
            
            Workspaces.forEach(
                function(item)
                {
                    // When necessary file is found, populate contents
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
                                pageNumber: theElement.firstChild.lastChild.innerHTML.replace("&amp;", "&"),
                                imageData: theElement.firstChild.firstChild.nodeName.toLowerCase() == "video" ? 
                                            theElement.firstChild.firstChild.getAttribute("src") + "-thisIsMedia":
                                            theElement.firstChild.firstChild.getAttribute("src")
                            }
                            item.fileContents.push(objectPushed);

                            if(objectPushed.imageData.includes("-thisIsMedia") || theElement.firstChild.classList.contains("imagePresent"))
                                videoFound = true;
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
            // Trigger the dropdown to refresh and display the new content
            thisButton.parent().next().next().find(".deck-to-view-options").trigger('change');
            
            doneLoading();
            thisButton.addClass("inactive").prop("disabled", true);
        }
    );


    // Select dropdown which determine which workspace to view
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
                thisOption.parent().prev().prev().find(".undo-button, .save-deck").addClass("inactive").prop("disabled", true);
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
                                        theWorkspace.fileContents[g].imageData.includes("-thisIsMedia") ?
                                        $("<video>").attr({"src": theWorkspace.fileContents[g].imageData.substring(0, theWorkspace.fileContents[g].imageData.indexOf("-thisIsMedia")), "class": "filePagePreviewed-2"}) : 
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
                            }
                            // If we are in three-mode display, change the cloned item into three-mode view sizing
                            else if(workspaceDisplayer.hasClass("three-view-display"))
                            {
                                elementAdded.classList.add("wholeSlideContainer-3");
                                elementAdded.classList.add(Object.keys(fileMasker).find(key => fileMasker[key] === theWorkspace.fileContents[g].fileFrom));
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                        theWorkspace.fileContents[g].imageData.includes("-thisIsMedia") ?
                                        $("<video>").attr({"src": theWorkspace.fileContents[g].imageData.substring(0, theWorkspace.fileContents[g].imageData.indexOf("-thisIsMedia")), "class": "filePagePreviewed-3"}) : 
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
                                // Unhiding the tags container 
                                if(g == 0)
                                {
                                    $("#add-tags-heading, #tagsContainer").animate( {opacity: "100%"}, 600);
                                    $("#deckContainer").animate( {"margin-left": "0px"}, 600 );
                                    $("#tagsContainer").removeClass("invisible");
                                    $("#tagInput").removeClass("inactive").prop("disabled", false);
                                }
                                elementAdded.classList.add("wholeSlideContainer-1");
                                elementAdded.classList.add(Object.keys(fileMasker).find(key => fileMasker[key] === theWorkspace.fileContents[g].fileFrom));
                                elementAdded.appendChild(
                                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                                        theWorkspace.fileContents[g].imageData.includes("-thisIsMedia") ?
                                        $("<video>").attr({"src": theWorkspace.fileContents[g].imageData.substring(0, theWorkspace.fileContents[g].imageData.indexOf("-thisIsMedia")), "class": "filePagePreviewed-1"}) : 
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

                        // Looping through the tags list and populating them into the container
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
                        // On click handling for the cancel button on the tags
                        $(".removeTag").unbind('click').bind('click',
                            function()
                            {
                                $(this).parent().parent().detach();
                                $("#single-mode").find(".save-deck").removeClass("inactive").prop("disabled", false);
                            }
                        );
                        break;
                    }
                }

                // On click handler for cancel button
                // Hide page when button clicked
                $(".cancelBtn").unbind('click').bind('click', workspaceUndo);
            }
        }
    );

    // Records the previous view state in the collection container
    var fromState = "";
    // handling on change event for the View state dropdown
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
                $("#addPagesToDeckbtn").addClass("inactive").prop("disabled", true);
                $("#insertInto-1, #insertInto-2, #insertInto-3").fadeOut();
                $("#package-navbar .undo-button").show();
                $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
                $("#tagsContainer").addClass("invisible");
                $("#tagInput").addClass("inactive").prop("disabled", true);
                $("#deckContainer").animate( {"margin-left": "60px"}, 600 );

                // whenever someone proceeds to view list of workspaces, clear all workspace viewers
                $(".deck-to-view-options").val("");
                $(".deck-to-view-options").trigger('change');

                $("#workspace-1, #full-mode").show();
                $("#single-mode, .two-view, .three-view").hide();
            }
            // One workspace mode
            else if (value == "1 deck")
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn").removeClass("inactive").prop("disabled", false);
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
            // Two workspaces mode
            else if(value == "2 decks")
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn").removeClass("inactive").prop("disabled", false);
                $("#addPagesToDeckbtn")[0].innerHTML = "I<br>n<br>s<br>e<br>r<br>t<br><br>I<br>n<br>t<br>o";
                $("#insertInto-3").fadeOut();
                $("#insertInto-1, #insertInto-2").fadeIn();
                $("#package-navbar .undo-button").hide();
                $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
                $("#tagsContainer").addClass("invisible");
                $("#tagInput").addClass("inactive").prop("disabled", true);
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
            // Three workspaces mode
            else
            {
                $("#tagsBatch").empty();
                $("#addPagesToDeckbtn").removeClass("inactive").prop("disabled", false);
                $("#addPagesToDeckbtn")[0].innerHTML = "I<br>n<br>s<br>e<br>r<br>t<br><br>I<br>n<br>t<br>o";
                $("#insertInto-1, #insertInto-2, #insertInto-3").fadeIn();
                $("#package-navbar .undo-button").hide();
                $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
                $("#tagsContainer").addClass("invisible");
                $("#tagInput").addClass("inactive").prop("disabled", true);
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

    // Package/Collection Undo button click handling
    $("#package-navbar .undo-button").on('click',
        function undoFunctionality()
        {
            if(itemsToUndo.undoFrom == "addPages")
            {
                itemsToUndo.items.forEach( (item) => { item.detach() } );    
            }
            else if(itemsToUndo.undoFrom == "removePage")
            {
                var prevElement = itemsToUndo.items[1];
                var nextElement = itemsToUndo.items[2];

                // If previous element existed 
                if(prevElement.length == 1)
                    prevElement[0].insertAdjacentElement("afterEnd", itemsToUndo.items[0][0]);
                // If next element existed
                else if (nextElement.length == 1)
                    $("#collectionViewer")[0].insertBefore(itemsToUndo.items[0][0], nextElement[0]);
                // The removed item was alone
                else
                    $("#collectionViewer")[0].appendChild(itemsToUndo.items[0][0]);
            }
            else if(itemsToUndo.undoFrom == "removeDeck")
            {
                var prevElement = itemsToUndo.items[3];
                var nextElement = itemsToUndo.items[4];

                // If previous element existed
                if(prevElement.length == 1)
                    prevElement[0].insertAdjacentElement("afterEnd", itemsToUndo.items[2][0]);
                // If next element existed
                else if (nextElement.length == 1)
                    $("#full-mode")[0].insertBefore(itemsToUndo.items[2][0], nextElement[0]);
                // The removed item was alone
                else
                    $("#full-mode")[0].appendChild(itemsToUndo.items[2][0]);

                // Inserting the workspace content back into the array
                Workspaces.splice(itemsToUndo.items[0], 0, itemsToUndo.items[1]);
            }
            // Disable this undo button
            $(this).addClass("inactive").prop("disabled", true);
            itemsToUndo.items = [];
        }
    );
    
    
    /**
     * Inserts pages into a workspace
     * @param {Node} theDisplayer - Jquery object: the workspace displayer
     */
    function minorBtnsClickHandler(theDisplayer)
    {
        var indexOfWorkspace;
        // Search for the desired workspace
        for(let  i = 0; i < Workspaces.length; i++)
        {
            if(Workspaces[i].fileName == theDisplayer.prev().find(".workspace-name-written").text())
            {
                indexOfWorkspace = i;
                break;
            }    
        }
        // Resetting the undo info
        if(indexOfWorkspace != null)
            itemsToUndo_3[theDisplayer.parent().attr("id")] = { undoFrom: "insertPage", items: [] };


        if($("#filePreviewGrid").hasClass("videoOnDisplay"))
        {
            // Activate save and undo button
            if(indexOfWorkspace != null)
                theDisplayer.prev().find(".save-deck, .undo-button").removeClass("inactive").prop("disabled", false);
            
            var theVideo = $("#filePreviewGrid").children()[0];
            var theVideoNameMask = theVideo.getAttribute("id");
            
            // Rendering the video on a hidden canvas to get cover page image
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
            
            // If we are in two-mode display, change the cloned item into two-mode view sizing
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
            // If we are in three-mode display, change the cloned item into three-mode view sizing
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
            // Otherwise we are in single view mode, changing cloned item into single-mode sizing
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
            // Adding the item to the things to undo array
            itemsToUndo_3[theDisplayer.parent().attr("id")].items.push(elementAdded);
        }
        else if($("#filePreviewGrid").hasClass("imageOnDisplay"))
        {
            // Activate save and undo button
            if(indexOfWorkspace != null)
                theDisplayer.prev().find(".save-deck, .undo-button").removeClass("inactive").prop("disabled", false);
            
            var theImage = $("#filePreviewGrid").children()[0];
            var theImageNameMask = theImage.getAttribute("id");

            let clonedItem = document.createElement("div");
            theDisplayer[0].appendChild(clonedItem);
            var elementAdded = theDisplayer[0].lastChild;
            elementAdded.id = "itemNum-" + indexOfWorkspace + "-" + parseInt(theDisplayer.children().length - 1);
            
            // If we are in two-mode display, change the cloned item into two-mode view sizing
            if(theDisplayer.hasClass("two-view-display"))
            {
                elementAdded.classList.add("wholeSlideContainer-2");
                elementAdded.classList.add(theImage.getAttribute("id").split('-')[0]);
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem imagePresent"}).append(
                        $("<img>").attr({"src": theImage.getAttribute("src"), "class": "filePagePreviewed-2"}),
                        $("<div></div>").attr({"class": " mediumPageNumber pageNumber"}).text(fileMasker[theImageNameMask])
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
            // If we are in three-mode display, change the cloned item into three-mode view sizing
            else if(theDisplayer.hasClass("three-view-display"))
            {
                elementAdded.classList.add("wholeSlideContainer-3");
                elementAdded.classList.add(theImage.getAttribute("id").split('-')[0]);
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem imagePresent"}).append(
                        $("<img>").attr({"src": theImage.getAttribute("src"), "class": "filePagePreviewed-3"}),
                        $("<div></div>").attr({"class": " smallPageNumber pageNumber"}).text(fileMasker[theImageNameMask])
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
                elementAdded.classList.add("wholeSlideContainer-1");
                elementAdded.classList.add(theImage.getAttribute("id").split('-')[0]);
                elementAdded.appendChild(
                    $("<div></div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem imagePresent"}).append(
                        $("<img>").attr({"src": theImage.getAttribute("src"), "class": "filePagePreviewed-1"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(fileMasker[theImageNameMask])
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
            // Adding the item to the things to undo array
            itemsToUndo_3[theDisplayer.parent().attr("id")].items.push(elementAdded);
        }
        else
        {
            var selectedPages = $("#filePreviewGrid .pageSelected");

            document.getElementById('select-all-pages').checked = false;

            if(selectedPages.length > 0)
            {
                // Activate the undo and save button
                if(indexOfWorkspace != null)
                    theDisplayer.prev().find(".save-deck, .undo-button").removeClass("inactive").prop("disabled", false);

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
                    
                    // If we are in two-mode display, change the cloned item into two-mode view sizing
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
                    // If we are in three-mode display, change the cloned item into three-mode view sizing
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
                    // Otherwise we are in single view mode, changing cloned item into single-mode sizing
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
                    // Adding the item to the things to undo array
                    itemsToUndo_3[theDisplayer.parent().attr("id")].items.push(elementAdded);
                }
            }
        } 
    }

    // On click handling for the smaller "numbered" Insert Pages buttons
    $(".smallerInsert").on('click', 
        function()
        {
            var buttonValue = $(this).text();
            var theDisplayer = $(".workspace-displayer:eq("+ buttonValue +")");

            if(buttonValue == "1" && (window.getComputedStyle($("#insertInto-2")[0]).display == "none" && window.getComputedStyle($("#insertInto-3")[0]).display == "none"))
                minorBtnsClickHandler($(".workspace-displayer:eq("+ (parseInt(buttonValue) - 1) +")"));
            else
                minorBtnsClickHandler(theDisplayer);
            
            // Handling cancel button click for the newly added workspace pages 
            $(".cancelBtn").unbind('click').bind('click', workspaceUndo); 
        }
    );

    // Simulating the effect where a button scales down when pressed, and reverts to normal size when released
    var pressedDown = false;

    $("#addPagesToDeckbtn").on('mousedown',
        function()
        {
            $(this).addClass("pressed");
            pressedDown = true;
        }    
    );
    
    $("#addPagesToDeckbtn").on('mouseleave',
        function()
        {
            if(pressedDown)
            {
                $(this).removeClass("pressed");
                pressedDown = false;
            }
        }    
    );

    // The Top Right Button on the right Preview Grid
    // On click, adds all selected/highlighted items to lower Collection grid
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
            
            $("#package-navbar .undo-button").removeClass("inactive").prop("disabled", false);                        

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
            
            // Rendering the video on a hidden canvas to get cover page image
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
            var theImage = $("#filePreviewGrid").children()[0];
            var theImageNameMask = theImage.getAttribute("id");
            var theImageName = fileMasker[theImageNameMask];
            
            $("#package-navbar .undo-button").removeClass("inactive").prop("disabled", false);                        

            // Adding the item to the things to undo array
            itemsToUndo.items.push(
                $("<div></div>").attr({"id": theImageNameMask+"-"+theImageNameMask, "class": "wholeSlideContainer imagePresent"}).append(                
                    $("<div</div>").attr({"class": "pageDisplayItem-2 deckItem deckLowerItem"}).append(
                        $("<img>").attr({"src": "files/"+theImageName, "class": "filePagePreviewed_1"}),
                        $("<div></div>").attr({"class": "pageNumber"}).text(theImageName)
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
        }
        else
        {
            var selectedPages = $("#filePreviewGrid .pageSelected");

            document.getElementById('select-all-pages').checked = false;

            if(selectedPages.length > 0)
            {
                $("#package-navbar .undo-button").removeClass("inactive").prop("disabled", false);

                // Loop through all selected items
                for(let i = 0; i < selectedPages.length; i++) 
                {
                    let item = selectedPages[i];
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
                $("#package-navbar .undo-button").removeClass("inactive").prop("disabled", false);
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
        $("#addPagesToDeckbtn").removeClass("inactive").prop("disabled", false);
        $("#addPagesToDeckbtn")[0].innerHTML = "A<br>d<br>d<br><br>t<br>o<br><br>D<br>e<br>c<br>k";

        $("#add-tags-heading, #tagsContainer").animate( {opacity: "0"}, 600);
        $("#tagsContainer").addClass("invisible");
        $("#tagInput").addClass("inactive").prop("disabled", true);
        $("#deckContainer").animate( {"margin-left": "60px"}, 600 );
        // Activate undo button
        $("#package-navbar .undo-button").addClass("inactive").prop("disabled", true).show();

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


    /**
     * Brings the user back to Full List View
     */
    function backToFullList()
    {
        // Deactivate undo button
        $("#package-navbar .undo-button").addClass("inactive").prop("disabled", true).hide();

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
                    pageNumber: collChildren[ch].firstChild.firstChild.nodeName.toLowerCase() == "video" || collChildren[ch].classList.contains("imagePresent") ? fileMasker[idSplitted[1]] : idSplitted[1],
                    imageData: collChildren[ch].firstChild.firstChild.nodeName.toLowerCase() == "video" ? 
                                collChildren[ch].firstChild.firstChild.getAttribute("src") + "-thisIsMedia":
                                collChildren[ch].firstChild.firstChild.getAttribute("src")
                }
                if(objectPushed.imageData.includes("-thisIsMedia") || collChildren[ch].classList.contains("imagePresent"))
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
            
            // On click handling for the workspace cancel button
            $(".removeDeck").unbind('click').bind('click',
                function()
                {
                    var thisButton = $(this);
                    var theWorkspace = thisButton.parent().parent();

                    // Reset undo info
                    itemsToUndo.items = [];
                    itemsToUndo.undoFrom = "removeDeck";

                    // Find the workspace inside the list and store the data, incase of undo
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
                    
                    // Storing undo info
                    itemsToUndo.items.push(theWorkspace);
                    itemsToUndo.items.push(theWorkspace.prev());
                    itemsToUndo.items.push(theWorkspace.next());
                    $("#package-navbar .undo-button").removeClass("inactive").prop("disabled", false);

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
                    // Remove page when button clicked
                    $(".cancelBtn").unbind('click').bind('click', workspaceUndo);
                }
            );
        }
    });

    // setting the select all functionality
    $("#select-all-pages").click(
        function()
        {
            // If it was checked, clicking it deselects all pages
            if(document.getElementById('select-all-pages').checked)
            {
                $("#filePreviewGrid .pageDisplayItem").addClass("pageSelected");
                $(".tickPage").prop("checked", true);
            }
            // If it was unchecked, clicking it selects all pages
            else
            {
                $("#filePreviewGrid .pageDisplayItem").removeClass("pageSelected");
                $(".tickPage").prop("checked", false);
            }
        }
    );


    // When this element gains focus, reveal the add button
    $("#tagInput").focus(() => { $("#plus-button").fadeIn(1000); $("#tagInput").removeClass("full-basis") });

    // When the element looses focus, hide the add button
    $("#tagInput").focusout(() => { $("#plus-button").fadeOut(); $("#tagInput").addClass("full-basis")  });

    /**
     * Handler that creates the tag element into the container
     */
    function createTagElement()
    {
        if($("#tagInput")[0].value.trim() != "")
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
            
            // On click handling for remove tag button
            $(".removeTag").unbind('click').bind('click',
                function()
                {
                    $(this).parent().parent().detach();
                    // Activate the save button
                    $("#single-mode").find(".save-deck").removeClass("inactive").prop("disabled", false);
                }
            );

            $("#single-mode").find(".save-deck").removeClass("inactive").prop("disabled", false);
            $("#tagInput").val("");    
        }
        else
        {
            alert("Can't create empty tag");
        }  
    }

    // Handling click for the add tag button
    $("#plus-button").on('click', () => { createTagElement() });


    /**
     * Selects all pages in the given number range
     */
    function selectRange()
    {
        var minValue = parseInt($("#minPageToSelect").val());
        var maxValue = parseInt($("#maxPageToSelect").val());

        if($("#minPageToSelect").val() == "")
            alert("The minimum field can't be empty!");
        else if($("#maxPageToSelect").val() == "")
            alert("The maximum field can't be empty!");
        else if(isNaN($("#minPageToSelect").val()))
            alert("Minimum field contains characters which are not numbers!");
        else if(isNaN($("#maxPageToSelect").val()))
            alert("Maximum field contains characters which are not numbers!");
        else if(minValue < 1)
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
            $("#select-multiple").removeClass("hovered");
            $(".numberRanges").blur();
        }
    }

    // When mouse enters this button, it should get hovered 
    $("#select-multiple").on('mouseenter', 
        function()
        {
            $(".numberRanges").blur();
            $(this).addClass("hovered");
        }    
    );

    // When mouse leaves the button, it should get unhovered
    $("#select-multiple").on('mouseleave', 
        function()
        {
            $(this).removeClass("hovered");
        }    
    );

    // When clicked, calls the handler to select pages in the given range
    $("#select-multiple").on('click', selectRange);

    $(document).on('keyup', 
        function (e) 
        {
            // Getting the event object
            e = e || window.event;

            if (e.key === 'Enter' || e.keyCode === 13)
            { 
                if ($("#maxPageToSelect").is(":focus") || $("#minPageToSelect").is(":focus") || $("#select-multiple").hasClass("hovered"))
                    selectRange();
                else if($("#tagInput").is(":focus"))
                    $("#plus-button").trigger('click');
            }
            else if(e.key == "ArrowLeft" || e.keyCode == 37 || e.key == "Left")
            {
                if($("#minPageToSelect").is(":focus"))
                {
                    $(".numberRanges").blur();
                    $("#select-multiple").addClass("hovered");
                }
                else if($("#maxPageToSelect").is(":focus"))
                    $("#minPageToSelect").focus();
                else if($("#select-multiple").hasClass("hovered"))
                {
                    $("#maxPageToSelect").focus();
                    $("#select-multiple").removeClass("hovered")
                }
            }
            else if(e.key == "ArrowRight" || e.keyCode == 39 || e.key == "Right")
            {
                if($("#maxPageToSelect").is(":focus"))
                {
                    $(".numberRanges").blur();
                    $("#select-multiple").addClass("hovered");
                }
                else if($("#minPageToSelect").is(":focus"))
                    $("#maxPageToSelect").focus();
                else if($("#select-multiple").hasClass("hovered"))
                {
                    $("#minPageToSelect").focus();
                    $("#select-multiple").removeClass("hovered")
                }
            }
        }
    );

    // Handling on click for the List-view checkbox 
    $("#list-view").click(
        function()
        {
            // Disable this checkbox
            $(this).prop("disabled", true);
            // Enable gallery-view checkbox
            document.getElementById('gallery-view').checked = false;
            $("#gallery-view").prop("disabled", false);

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
            // Disable this checkbox
            $(this).prop("disabled", true);
            // Enable List-view checkbox
            document.getElementById('list-view').checked = false;
            $("#list-view").prop("disabled", false);

            $("#filePreviewContainer").removeClass("List-view-mode");
            $("#filePreviewContainer").addClass("Gallery-view-mode");

            $("#filePreviewGrid").hide();
            $("#PagePreviewGrid, #PagesListContainer").show();

            if(firstTimeGalleryView)
            {
                $("#PagesListContainer").addClass("position-relative");
                var pages = $("#PagesListContainer").children();

                // Getting the offsets of each page
                for(let hj = 0; hj < pages.length; hj++)
                    pagesOffsets["page_"+ (hj+1)] = pages[hj].offsetLeft;

                firstTimeGalleryView = false;
                scrollAmount = 0;
                $("#PagesListContainer").removeClass("position-relative");
            }
        }
    );

    // Simulating the effect where a button scales down when pressed, and reverts to normal size when released
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
                // Copying the workspaces to a new JSON object
                var theWorkspaces = JSON.parse(JSON.stringify(Workspaces));

                // Deleting certain fields since back-end format was changed
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

                /**
                 * Checks if the export As of a workspace is a powerpoint and generates the powerpoint
                 */
                function checkForPowerpoint()
                {
                    // Looping through each workspace
                    Workspaces.forEach( (item) =>
                        {
                            let file = item;
                            if(file.exportAs == "Powerpoint(.pptx)")
                            {
                                let exportPresentation = new PptxGenJS();

                                file.fileContents.forEach( (itm) => 
                                { 
                                    var theSlide = exportPresentation.addSlide();

                                    // If current page is a video, get cover page of video, from the invisible canvas
                                    if(itm.pageNumber.includes("mp4"))
                                    {
                                        var videoPath = itm.imageData.substring(0, itm.imageData.indexOf("-thisIsMedia")) == "" ? 
                                                        itm.imageData : itm.imageData.substring(0, itm.imageData.indexOf("-thisIsMedia"));

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
                                        // This is a temporary solution for a minimum viable product
                                        // When the file is done downloading, send a request to the server to copy it to the collection directory
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

                                            }, 7000);
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
/**
 * Receives the array of files and their data and sends it to main thread
 * @param {Array.<{file_name: String, last_modified: {date: String, month: String, year: String}}>} fileArray - List of files and their data
 */
function sendData(fileArray)
{
    console.log(fileArray);
    var theFiles = {};
    var fileMasker = {};
    // Loop through and create new object data in different format
    fileArray.forEach(
        function(item, index)
        {
            // Encoding the file names behind keys, since these will be used in dom element classes and id
            fileMasker["mask_" + index] = item.file_name;

            theFiles["mask_" + index] = [];
        }
    );

    // When the window is done loading, call the main thread function
    $(window).on('load', mainThread(fileArray, theFiles, fileMasker));
}
// When the document is loaded send a get request to server, to get list of files in chosen directory 
$(document).ready(
    function()
    {
        $.get( "api/files", function(data) { sendData(data.files); });
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
