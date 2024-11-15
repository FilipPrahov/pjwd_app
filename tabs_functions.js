//header for the inventory list table
const headerInvTable = '<table class="table table-bordered">' +
			'<thead><tr><th>Ref</th><th>Type</th><th>Description</th><th>Barcode</th><th>Qty</th></tr></thead>' +
			'<tbody>';
			
//header for the new delivery receipt table
const headerNewDelReceipt = '<table class="table table-bordered">' +
			'<thead><tr><th>Item</th><th>Quantity</th></tr></thead><tbody>';

//new delivery receipt temp data structure
var newDelReceiptArray = [];

//function to escape unsafe characters during http communication
function escapeHtml(unsafe) {
	return String(unsafe)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

//this function prepares the body of an HTML table from the parameter array
function makeTableHTML(myArray) {
	var result = '';
	var k;
	for(var i=0; i<myArray.length; i++) {
		result += "<tr>";
		for(var j=0; j<myArray[i].length; j++){
			k = escapeHtml((myArray[i][j]));
			result += "<td>"+k+"</td>";
		}
		result += "</tr>";
	}
	result += "</tbody></table>";
	
	return result;
}

//FE calls BE to get the inventory of a warehouse
function getInventory(whRef){
	const getReq = new XMLHttpRequest();
	getReq.open('GET', 'http://localhost:8080/inventory/'+whRef, true);
	getReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	getReq.onload = () => {
		// Request finished. Do processing here.
		var inventoryArray = JSON.parse(getReq.responseText);
		
		var invTableHtml = headerInvTable + makeTableHTML(inventoryArray);
		document.getElementById("inventoryList"+whRef).innerHTML = invTableHtml;
	};

	getReq.send(null);
}

//FE calls BE to get total inventory of all warehouses in the company
function getTotalInventory(){
	const getReq = new XMLHttpRequest();
	getReq.open('GET', 'http://localhost:8080/inventory/totals', true);
	getReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	getReq.onload = () => {
		// Request finished. Do processing here.
		var inventoryArray = JSON.parse(getReq.responseText);
		
		var invTableHtml = headerInvTable + makeTableHTML(inventoryArray);
		document.getElementById("totalInventoryList").innerHTML = invTableHtml;
	};

	getReq.send(null);
}

//Function to combine the header and body of the New Delivery Receipt table and display it on page
function displayDelRecTable(){
	//combine particular header with the existing array
	var delRecArray = headerNewDelReceipt + makeTableHTML(newDelReceiptArray);
	//rebuild the table on the page
	document.getElementById("newDelRecShipOrder").innerHTML = delRecArray;
}

//This function adds the item and quantity to New Delivery Receipt table
function AddRecordToList(){
	var itemRef = document.getElementById('itemRef').value;
	//console.log(itemRef);
	var itemQty = document.getElementById('itemQty').value;
	//console.log(itemQty);
	if (!itemRef || !itemQty){
		alert("Please, fill in item ref and quantity");
		return;
	} else if (itemQty <= 1) {
		alert("Please, enter positive quantity");
		return;
	} else {
		//represent new record in the delivery receipt as an array of ref and qty
		var newRow = [itemRef, itemQty];
		//push the new record into the existing array
		newDelReceiptArray.push(newRow);
		//display table
		displayDelRecTable();
	}
}

//This function clears the Delivery Receipt modal
function ClearDelRecList(){
	newDelReceiptArray = [];
	//display table
	displayDelRecTable();
	document.getElementById('itemRef').value = null;
	document.getElementById('itemQty').value = null;
}

//Function to send the New Delivery Receipt to the BE. 
//The Warehouse id is taken from on-page attribute
function submitDelRec(){
	var whRef = document.getElementById('delReceiptShipOrder').getAttribute('data-tab-value');
	console.log(whRef);
	var data = JSON.stringify(newDelReceiptArray);
	const postReq = new XMLHttpRequest();
	postReq.open('POST', 'http://localhost:8080/inventory/'+whRef+'/new-del-rec', true);
	postReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	postReq.onload = () => {
		 // do something to response
		console.log(this.responseText);
		//clear the modal
		ClearDelRecList();
	};

	postReq.send(data);
}

//Function to send the New Shipment Order to the BE.
//The Warehouse id is taken from on-page attribute	
function submitShipmentOrder(){
	var whRef = document.getElementById('delReceiptShipOrder').getAttribute('data-tab-value');
	console.log(whRef);
	//Shipment Order is the same as Delivery Receipt except that the quantities 
	//are removed instead of added to the warehouse.
	//Turn quantities to negative
	for (var rec of newDelReceiptArray){
		rec[1] = Number(rec[1])*(-1);
	}
	var data = JSON.stringify(newDelReceiptArray);
	const postReq = new XMLHttpRequest();
	postReq.open('POST', 'http://localhost:8080/inventory/'+whRef+'/new-del-rec', true);
	postReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	postReq.onload = () => {
		 // do something to response
		console.log(this.responseText);
		//clear the modal
		ClearDelRecList();
	};

	postReq.send(data);
}

//when some tab is opened, set a "global" variable to be able to re-use some modals, functions, etc.
function openModal(tabValue) {
	document.getElementById('delReceiptShipOrder').setAttribute('data-tab-value', tabValue);
}

//sends information for the creation of new book item
function submitNewBook(){
	var bookData = [];
	<!--(description, barcode, author, title, isbn)-->
	bookData.push(document.getElementById('description').value);
	bookData.push(document.getElementById('barcode').value);
	bookData.push(document.getElementById('author').value);
	bookData.push(document.getElementById('title').value);
	bookData.push(document.getElementById('isbn').value);
	console.log(bookData);

	var data = JSON.stringify(bookData);
	const postReq = new XMLHttpRequest();
	postReq.open('POST', 'http://localhost:8080/item-catalogue/new-book', true);
	postReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	postReq.onload = () => {
		 // do something to response
		console.log(this.responseText);
		//clear the modal
		ClearNewBookForm();
	};

	postReq.send(data);
}

//Function to clear New Book Form Modal
function ClearNewBookForm(){
	document.getElementById('description').value = null;
	document.getElementById('barcode').value = null;
	document.getElementById('author').value = null;
	document.getElementById('title').value = null;
	document.getElementById('isbn').value = null;
}

//sends information for the creation of new pencil set item
function submitNewPencilSet(){
	var pencilSet = [];
	<!--(psdescription, psbarcode, pcs, color, hardness)-->
	pencilSet.push(document.getElementById('psdescription').value);
	pencilSet.push(document.getElementById('psbarcode').value);
	pencilSet.push(document.getElementById('pcs').value);
	pencilSet.push(document.getElementById('color').value);
	pencilSet.push(document.getElementById('hardness').value);
	console.log(pencilSet);

	var data = JSON.stringify(pencilSet);
	const postReq = new XMLHttpRequest();
	postReq.open('POST', 'http://localhost:8080/item-catalogue/new-pencil-set', true);
	postReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	postReq.onload = () => {
		 // do something to response
		console.log(this.responseText);
		//clear the modal
		ClearNewPencilSetForm();
	};

	postReq.send(data);
}

//Function to clear New Pencil Set Form Modal
function ClearNewPencilSetForm(){
	document.getElementById('psdescription').value = null;
	document.getElementById('psbarcode').value = null;
	document.getElementById('pcs').value = null;
	document.getElementById('color').value = null;
	document.getElementById('hardness').value = null;
}


//sends information for the creation of new notebook item
function submitNewNotebook(){
	var notebook = [];
	<!--(nbdescription, nbbarcode, hasSpiral, nbSheets, nbhardcover)-->
	notebook.push(document.getElementById('nbdescription').value);
	notebook.push(document.getElementById('nbbarcode').value);
	//push yes/no for boolean values
	if (document.getElementById('hasSpiral').value == 'on'){
		notebook.push('yes');
	} else {
		notebook.push('no');
	};
	notebook.push(document.getElementById('nbSheets').value);
	//push yes/no for boolean values
	if (document.getElementById('nbhardcover').value == 'on'){
		notebook.push('yes');
	} else {
		notebook.push('no');
	};
	console.log(notebook);

	var data = JSON.stringify(notebook);
	const postReq = new XMLHttpRequest();
	postReq.open('POST', 'http://localhost:8080/item-catalogue/new-notebook', true);
	postReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	postReq.onload = () => {
		 // do something to response
		console.log(this.responseText);
		//clear the modal
		ClearNewNotebookForm();
	};

	postReq.send(data);
}

//Function to clear New Notebook Form Modal
function ClearNewNotebookForm(){
	document.getElementById('nbdescription').value = null;
	document.getElementById('nbbarcode').value = null;
	document.getElementById('hasSpiral').value = null;
	document.getElementById('nbSheets').value = null;
	document.getElementById('nbhardcover').value = null;
}
