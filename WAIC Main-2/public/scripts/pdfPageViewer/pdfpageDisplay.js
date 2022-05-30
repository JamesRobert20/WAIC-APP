$(window).on('load', () =>
{
    var PDF_DOC, TOTAL_PAGES;

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
        showPage(3)
    }

    var CURRENT_PAGE,
    _PAGE_RENDERING_IN_PROGRESS = 0,
    _CANVAS = document.querySelector('#page-1');

    // load and render specific page of the PDF
    async function showPage(page_no)
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

        console.log(_CANVAS.height);

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

    showPDF('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
});


