
## Set up ##

You must have node.js installed to be able to run the project. If you do not have it,
visit https://nodejs.org/en and download the latest version by following the instructions.
Make sure node is added to your path.

Place files item.js, warehouse.js, itemCatalogue.txt, and warehouse.txt in one folder.
Files Tabs.html and tabs_functions.js can be placed in any folder on the same machine,
but both must be in the same folder.
The server is implemented in warehouse.js, and it listens on localhost, port 8080.
The client is implemented in Tabs.html

## Initialization ##

If you want to initialize new company with 2 empty warehouses, then delete files
itemCatalogue.txt, and warehouse.txt. Start the server and the application, create 
manually the items, and add quantities via the functions in the application.

## Start the server ##

Open terminal and navigate to the folder where warehouse.js is located.
To start the server, run the following command:

node warehouse.js

## Use the app ##

Open file Tabs.html via any common browser.

## Functionality ##

Please, note that this is a PoC (Proof of Concept) app which is developed as a deliverable
for IU course project DLBCSPJWD01. 


