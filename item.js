'use strict';
const fs = require('node:fs');

class Item {

	constructor(ref, type, description, barcode ){
		//set the common attributes of items
		this.ref = ref;
		this.type = type;
		this.description = description;
		this.barcode = barcode;
		
	}
	
	getDescription() {
		var result = "Ref: " + this.ref + 
			" Type: " + this.type +
			" Description:" + this.description +
			" Barcode:" + this.barcode;

		return result;
	}
	
	JSONstringify() {
		return JSON.stringify(this);
	}
	
	toString(){
		return this.getDescription();
	}
}

class Book extends Item {
	
	constructor(ref, type, description, barcode, author, title, isbn){
		super(ref, type, description, barcode);
		this.author = author;
		this.title = title;
		this.isbn = isbn;
	}
	
	getDescription() {
		var result = super.getDescription() +
            " Author: " + this.author +
            " Title: " + this.title + 
			" ISBN: " + this.isbn;
        return result;
	}
}

class PencilSet extends Item {
	
	constructor(ref, type, description, barcode, pcs, color, hardness){
		super(ref, type, description, barcode);
		this.pcs = pcs;
		this.color = color;
		this.hardness = hardness;
	}
	
	getDescription() {
		var result = super.getDescription() +
            " Number of pieces: " + this.pcs +
            " Color: " + this.color + 
			" Hardness: " + this.hardness;
        return result;
	}
}

class Notebook extends Item {
	
	constructor(ref, type, description, barcode, hasSpiral, nbSheets, hardcover){
		super(ref, type, description, barcode);
		this.hasSpiral = hasSpiral;
		this.nbSheets = nbSheets;
		this.hardcover = hardcover;
	}
	
	getDescription() {
		var result = super.getDescription() +
            " With Spiral: " + this.hasSpiral +
            " number of sheets: " + this.nbSheets + 
			" Hardcover: " + this.hardcover;
        return result;
	}
}

module.exports = {Item,Book,PencilSet,Notebook};