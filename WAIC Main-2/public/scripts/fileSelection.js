//1368px width
// Root container carrying all elements
var rootContainer = $("<div></div>").attr({"id": "root-container", "class": "pageContainer container-fluid"});
$("body").append(rootContainer);

// Top navigation bar
rootContainer.append(navigationBar); 

// Centering the items
var centered = $("<center></center>");
rootContainer.append(centered);

centered.append(fileSelectionGrids);

// New collection heading and container
centered.append(collectionForm);
