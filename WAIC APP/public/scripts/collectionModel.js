// As the app starts
// Get this Collection from the back-end through a get request 
// Loop through it and make an array to summarize all pdf files to be pulled from
var Collection = 
{
    name: "My new Collection",

    files: [
        {
            fileName: "Filename-1",
            exportAs: "pdf",
            fileContents: [
                            {
                                fileFrom: "Potter.pdf",
                                pageNumber: "3",
                                imageData: ""
                            }, 
                            {
                                fileFrom: "Potter.pdf",
                                pageNumber: "2",
                                imageData: ""
                            }
                        ]
        },
        {
            fileName: "Filename-2",
            exportAs: "powerpoint",
            fileContents: [
                            {
                                fileFrom: "Potter.pdf",
                                pageNumber: "3",
                                imageData: ""
                            }, 
                            {
                                fileFrom: "Percyjack.pdf",
                                pageNumber: "6",
                                imageData: ""
                            }
                        ]
        }
    ]
}


