'use strict';

var {Item,Book,PencilSet,Notebook} = require('./item');
const fs = require('node:fs');

var http = require('http');
var url = require('url');




//function to formulate http response
function sendResponse(response, text){
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.write(text);
  response.end();
}


//This class contains a data structure which implements a Warehouse
//and some class methods 
class Warehouse {
	constructor(whName){
		this.warehouseName = whName;
		this.itemList = {};
	}
	
	//get the current quantity of this item in the list
	getQtyInStock(Item){
		var iQty;
		if (this.itemList[Item.ref]){
			iQty = this.itemList[Item.ref];
			//console.log(iQty);
		} else {
			iQty = 0;
		}
		return iQty;
	}

	//get the current quantity of this item in the list
	addItems(Item, qty){
		var currQty;
		currQty = this.getQtyInStock(Item);
		
		//Check if the new quantity is non-negative
		if ((currQty + Number(qty)) >= 0){
			this.itemList[Item.ref] = currQty + Number(qty);
		} else {
			console.log("Error: not enough quantity of this item!");
		}
	}

	//helper function to print itemList 
	printItemList(){
		console.log(this.itemList);
	}
	

	//helper function to create JSON string
	JSONstringify() {
		return JSON.stringify(this);
	}
	
	//helper function 
	toString(){
		return this.JSONstringify();
	}
}

//This is the main class which implements the Company
class Company {
	constructor(){
		this.whList = [];					//list of warehouses of the company
		this.itemCatalogue = [];			//catalogue of the items which the company can receive/send
		this.tempArray = [];				//helper data structure
		
		//read stored list of items from file
		console.log("Reading data from itemCatalogue.txt: ");
		fs.readFile('itemCatalogue.txt', 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			
			this.tempArray = JSON.parse(data);
			//recreate items depending on their type
			this.tempArray.forEach((element) => {
				var result = null;
				switch (element.type){
					case 'book':
						result = new Book();
						break;
					case 'pencilSet':
						result = new PencilSet();
						break;
					case 'notebook':
						result = new Notebook();
						break;
				}
				Object.assign(result, element);
				console.log(typeof(result));
				//add resulting item to the list of items
				this.itemCatalogue.push(result);
			});
			//empty the tempArray after we are done with it
			this.tempArray = [];
			this.printItemCatalogue();
		});
		
		//read stored list of warehouses from file
		console.log("Reading data from warehouse.txt: ");
		fs.readFile('warehouse.txt', 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			//make sure tempArray is empty before we start using it
			this.tempArray = [];
			this.tempArray = JSON.parse(data);
			//recreate Warehouse object from the read data
			this.tempArray.forEach((element) => {
				var result = new Warehouse();
				Object.assign(result, element);
				console.log(typeof(result));
				this.whList.push(result);
			});
			//empty the tempArray after we are done with it
			this.tempArray = [];
			console.log("====WHlist contents====");
			this.whList.forEach((element) => console.log(element));
			console.log("====End WhList contents====");
		});
	}
	
	//create new Warehouse in the Company
	addWarehouse(warehouse){
		//check if the warehouse already exists in the whList
		var whExists = false;
		for (var wh in this.whList){
			if (wh === warehouse){
				whExists = true;
			}
		}
		//add warehouse if not exist in the whList
		if (!whExists){
			this.whList.push(warehouse);
		}
	}
	
	//add Item to Item catalogue of the Company
	addItemsToCatalogue(Item){
		//check if the Item already exists in the itemCatalogue
		var icExists = false;
		icExists = this.itemCatalogue.includes(Item);
		//console.log("The item " + Item + " exists in itemCatalogue: " + icExists);
		//add item if not exists in the ItemCatalogue
		if (!icExists){
			this.itemCatalogue.push(Item);
		}
	}

	//Create am array which contains the common attributes of all items plus 
	//the quantity of the item in Warehouse wh.
	//The Inventory is printed to the console and is also returned to caller function
	printInventory(wh){
		console.log("====Inventory List for warehouse " + wh.warehouseName + "====");
		var inventoryText = '';
		var inventory = [];
		var inventoryTuple = [];
		this.itemCatalogue.forEach((element)=> {
			//Items with quantity 0 are also included because during physical inventory count
			//of a Warehouse it is possible to find an item which was not shipped by mistake
			if (wh.getQtyInStock(element) >= 0){
				console.log(element.ref + " : " + 
							element.type + " : " +
							element.description + " : " +
							element.barcode + " : " + wh.getQtyInStock(element));
				inventoryTuple = [];
				inventoryTuple.push(element.ref);
				inventoryTuple.push(element.type);
				inventoryTuple.push(element.description);
				inventoryTuple.push(element.barcode);
				inventoryTuple.push(wh.getQtyInStock(element));
				inventory.push(inventoryTuple);
			}
		});
		console.log(inventory);
		console.log("====End of Inventory List for warehouse " + wh.warehouseName + "====");
		return inventory;
	}
	
	//helper function which prints current Item Catalogue
	printItemCatalogue(){
		if (this.itemCatalogue.length > 0){
			this.itemCatalogue.forEach((element)=> console.log(element));
		} else {
			console.log("Item catalogue is empty!");
		}
	}
	
	//find and return the max reference in the Item Catalogue
	//this function is necessary for the creation of new Item in the Catalogue
	getMaxElemRef(){
		var maxElemRef = 0;
		this.itemCatalogue.forEach((element)=> {
			if (element.ref > maxElemRef){
				maxElemRef = element.ref;
			}
		});
		return maxElemRef;
	}
	
	
	//create New Book Item Card
	createNewBookItemCard(description, barcode, author, title, isbn){
		var newRef = this.getMaxElemRef() + 1;
		var book = new Book(newRef, 'book', description, barcode, author, title, isbn);
		this.addItemsToCatalogue(book);
		
	}
	
	//create New Pencil Set Item Card
	createNewPencilSetItemCard(description, barcode, pcs, color, hardness){
		var newRef = this.getMaxElemRef() + 1;
		var pencilSet = new PencilSet(newRef, 'pencilSet', description, barcode, pcs, color, hardness);
		this.addItemsToCatalogue(pencilSet);
		
	}
	
	//create New Notebook Item Card
	createNewNotebookItemCard(description, barcode, hasSpiral, nbSheets, hardcover){
		var newRef = this.getMaxElemRef() + 1;
		var notebook = new Notebook(newRef, 'notebook', description, barcode, hasSpiral, nbSheets, hardcover);
		this.addItemsToCatalogue(notebook);
		
	}
	
	//write any changes to the persistent storage 
	storeData(){
		//empty the warehouse.txt and itemCatalogue.txt file
		fs.writeFile('warehouse.txt', '', err => {
			if (err) {
				console.error(err);
			} else {
			// file emptied successfully
			}
		});
		
		fs.writeFile('itemCatalogue.txt', '', err => {
			if (err) {
				console.error(err);
			} else {
			// file emptied successfully
			}
		});
		
		//write the current content of whList[] to file
		var warehouseJSON = JSON.stringify(this.whList);
		fs.writeFile('warehouse.txt', warehouseJSON, { flag: "a+" }, err => {
			if (err) {
				console.error(err);
			} else {
				// file written successfully
			}
		});
		
		//write the current content of itemCatalogue[] to file
		var itemCatJSON = JSON.stringify(this.itemCatalogue);
		fs.writeFile('itemCatalogue.txt', itemCatJSON, { flag: "a+" }, err => {
			if (err) {
				console.error(err);
			} else {
				// file written successfully
			}
		});
	}
	
}



function TestProgram() {
	//Test program run
	//Initialize item reference
	var currentItemRef = 0;
	
	//empty the warehouse.txt and itemCatalogue.txt file
	fs.writeFile('warehouse.txt', '', err => {
		if (err) {
			console.error(err);
		} else {
		// file emptied successfully
		}
	});
	
	fs.writeFile('itemCatalogue.txt', '', err => {
		if (err) {
			console.error(err);
		} else {
		// file emptied successfully
		}
	});
	
	// Create company
	var myCompany = new Company();
	
	// Create warehouses
	var warehouse1 = new Warehouse("Warehouse1");
	var warehouse2 = new Warehouse("Warehouse2");
	
	//Add warehouses to the Company
	myCompany.addWarehouse(warehouse1);
	myCompany.addWarehouse(warehouse2);
	console.log("===MyCompany WH list===");
	console.log(myCompany.whList);
	console.log("===End===");
	
	//Create some items
	var book1 = new Book(++currentItemRef, 'book','political philosophy','342526828839','Timothy Snyder','On freedom','978-0593728727');
	console.log(book1);
	//test adding item to catalogue
	myCompany.addItemsToCatalogue(book1);
	//test that item is not added second time to catalogue
	myCompany.addItemsToCatalogue(book1);
	
	//test creation of other types of items and their addition to catalogue
	var pencil1 = new PencilSet(++currentItemRef, 'pencilSet','multi-color drawing set','83737464446',12,'multicolor','HB');
	console.log(pencil1);
	myCompany.addItemsToCatalogue(pencil1);
	
	var notebook1 = new Notebook(++currentItemRef, 'notebook','A4 size notebook','7273939393',true,80,true);
	console.log(notebook1);
	myCompany.addItemsToCatalogue(notebook1);

	//test adding items to warehouse with some arbitrary quantities - simulates Delivery Receipt 
	warehouse1.addItems(book1, 50);
	warehouse1.addItems(pencil1, 150);
	warehouse1.addItems(notebook1, 250);
	warehouse1.addItems(book1, 25);
	//test removal of some quantity of some item from some warehouse - simulates Shipment Order
	warehouse1.addItems(book1, -5);
	
	//Print the current items and quantities in the warehouse
	console.log("Content of warehouse1");
	warehouse1.printItemList();
	
	//Perform similar tests with the second warehouse to verify that the items are added to the correct warehouse
	warehouse2.addItems(book1, 150);
	warehouse2.addItems(pencil1, 180);
	warehouse2.addItems(notebook1, 350);
	warehouse2.addItems(book1, 250);
	warehouse2.addItems(book1, -50);
	
	console.log("Content of warehouse2");
	warehouse2.printItemList();
	
	myCompany.printInventory(warehouse1);
	myCompany.printInventory(warehouse2);
	
	//test creation of new Book item
	myCompany.createNewBookItemCard('personal development', '9780762408337', 'Stephen R. Covey', '7 habits of highly effective people', '978-0-7624-0833-7');
	//test creation of new pencil set item
	myCompany.createNewPencilSetItemCard('Color drawing set for kids','33644424446',24,'multicolor','H2');
	//test creation of new notebook item
	myCompany.createNewNotebookItemCard('A6 size notebook','457983934422',true,120,false);
	
	//test writing data to persistent storage
	myCompany.storeData();
}



function TestProgram2(){
	// Create company
	var myCompany = new Company();
	
	//create server and define its functions
	var server = http.createServer((request, response) => {
			// Set CORS headers
			response.setHeader('Access-Control-Allow-Origin', '*');
			response.setHeader('Access-Control-Request-Method', '*');
			response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
			response.setHeader('Access-Control-Allow-Headers', '*');
			if ( request.method === 'OPTIONS' ) {
				response.writeHead(200);
				response.end();
				return;
			}
		//URL parsing
		var parsedUrl = url.parse(request.url);
		var path = parsedUrl.pathname;
		var parsedBody = '';
		
		//GET requests treated here
		if ( request.method === 'GET'){
			switch (path) {
				//this is a test path which is not used in the application
				case "/index.html":
					sendResponse(response, "hello from index.html");
					break;
				
				//this is another test path which verifies connection to myCompany object
				case "/otherpage.html":
					sendResponse(response, JSON.stringify(myCompany.getMaxElemRef()));
					break;
				
				//get inventory list for wh1
				case "/inventory/wh1":
					var invText = JSON.stringify(myCompany.printInventory(myCompany.whList[0]));
					console.log(invText);
					sendResponse(response, invText);
					break;
				
				//get inventory list for wh2
				case "/inventory/wh2":
					var invText = JSON.stringify(myCompany.printInventory(myCompany.whList[1]));
					console.log(invText);
					sendResponse(response, invText);
					break;

				//get total inventory list
				case "/inventory/totals":
					//create empty temp warehouse
					var tempWh  = new Warehouse("TempWarehouse");
					myCompany.itemCatalogue.forEach((element)=> {
						var totQty = 0;
						//Loop through the item lists of all existing warehouses
						//and add number of items currently available
						myCompany.whList.forEach((wh) => {
							totQty += wh.getQtyInStock(element);
						});
						tempWh.addItems(element, totQty);
					});
					console.log(tempWh);
					var invText = JSON.stringify(myCompany.printInventory(tempWh));
					console.log(invText);
					sendResponse(response, invText);
					break;
				
				
				default:
				response.statusCode = 404;
				response.setHeader('Content-Type', 'text/plain');
				response.write('Page ' + path + ' not found');
				response.end();
				break;
			}
		}
	
		//POST requests treated here
		if ( request.method === 'POST'){
			switch (path) {
				//delivery receipt or shipment order for wh1
				case "/inventory/wh1/new-del-rec":
					//POST request contains body which comes in chunks, and it should be stored 
					//in temp variable so that the program can process it when it is fully transferred
					let body = '';

					request.on('data', chunk => {
						body += chunk.toString();
					});

					request.on('end', () => {
						parsedBody = JSON.parse(body);
						console.log(parsedBody);
						console.log(typeof(parsedBody));

						var newDelRecArray = [];
						Object.assign(newDelRecArray, parsedBody); 
						console.log(newDelRecArray);
						console.log(typeof(newDelRecArray));
						//register received items in wh1
						for (var rec of newDelRecArray){
							var flag = false;
							//console.log(rec);
							//console.log(rec[0]);
							//console.log(rec[1]);
							myCompany.itemCatalogue.forEach((element)=> {
								if (element.ref == rec[0]){
									myCompany.whList[0].addItems(element, rec[1]);
									flag = true;
								}
							});
							if (flag == false){
								console.log("Item with item ref " + rec[0] + " not found!");
							}
						}
						myCompany.storeData();
						sendResponse(response, "ok");
					});
					break;
				
				//delivery receipt or shipment order for wh2
				case "/inventory/wh2/new-del-rec":
					let body2 = '';

					request.on('data', chunk => {
						body2 += chunk.toString();
					});

					request.on('end', () => {
						parsedBody = JSON.parse(body2);
						console.log(parsedBody);
						console.log(typeof(parsedBody));

						var newDelRecArray = [];
						Object.assign(newDelRecArray, parsedBody); 
						console.log(newDelRecArray);
						console.log(typeof(newDelRecArray));
						//register received items in wh2
						for (var rec of newDelRecArray){
							var flag = false;
							//console.log(rec);
							//console.log(rec[0]);
							//console.log(rec[1]);
							myCompany.itemCatalogue.forEach((element)=> {
								if (element.ref == rec[0]){
									myCompany.whList[1].addItems(element, rec[1]);
									flag = true;
								}
							});
							if (flag == false){
								console.log("Item with item ref " + rec[0] + " not found!");
							}
						}
						myCompany.storeData();
						sendResponse(response, "ok");
					});
					break;
					
				//create new Book item in the Catalogue
				case "/item-catalogue/new-book":
					let body3 = '';

					request.on('data', chunk => {
						body3 += chunk.toString();
					});

					request.on('end', () => {
						parsedBody = JSON.parse(body3);
						console.log(parsedBody);
						console.log(typeof(parsedBody));

						myCompany.createNewBookItemCard(parsedBody[0], parsedBody[1], parsedBody[2],parsedBody[3],parsedBody[4]);
						myCompany.storeData();
						sendResponse(response, "ok");
					});
					break;
				
				//create new Pencil Set item in the Catalogue
				case "/item-catalogue/new-pencil-set":
					let body4 = '';

					request.on('data', chunk => {
						body4 += chunk.toString();
					});

					request.on('end', () => {
						parsedBody = JSON.parse(body4);
						console.log(parsedBody);
						console.log(typeof(parsedBody));

						myCompany.createNewPencilSetItemCard(parsedBody[0], parsedBody[1], parsedBody[2],parsedBody[3],parsedBody[4]);
						myCompany.storeData();
						sendResponse(response, "ok");
					});
					break;
					
				//create new Notebook item in the Catalogue
				case "/item-catalogue/new-notebook":
					let body5 = '';

					request.on('data', chunk => {
						body5 += chunk.toString();
					});

					request.on('end', () => {
						parsedBody = JSON.parse(body5);
						console.log(parsedBody);
						console.log(typeof(parsedBody));

						myCompany.createNewNotebookItemCard(parsedBody[0], parsedBody[1], parsedBody[2],parsedBody[3],parsedBody[4]);
						myCompany.storeData();
						sendResponse(response, "ok");
					});
					break;

					
				default:
					response.statusCode = 404;
					response.setHeader('Content-Type', 'text/plain');
					response.write('Page ' + path + ' not found');
					response.end();
					break;
			}
		}
	
	});

	//start http server on port 8080
	server.listen(8080);

}

//TestProgram();
TestProgram2();