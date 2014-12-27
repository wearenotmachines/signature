function Signature(element, config) {

	this.instances = [];
	this.elements = [];
	this.config = config ? config : {};

	this.init = function(element, config) {
		//defaults
		config.width = config.width || 400;
		config.height = config.height || 200;
		config.penColour = config.penColour || "#333333";
		config.penWidth = config.penWidth || 1;
		if (undefined!=config.cursorIcon) {
			if (config.cursorIcon.constructor!="Array") {
				config.cursorIcon = config.cursorIcon.split(",");
			}
			for (var n in config.cursorIcon) {
				if (config.cursorIcon[n].indexOf(".")>-1 && !/(url\()(.)(\))/.test(config.cursorIcon[n])) {
					config.cursorIcon[n] = "url("+config.cursorIcon[n]+")";
				}
			}
			config.cursorIcon.push("auto");
		} else {
			config.cursorIcon = ["crosshair"];
		}
		config.lineOffsetLeft = config.lineOffsetLeft || 0;
		config.lineOffsetTop = config.lineOffsetTop || 0;
		if (!config.imageSaveURL) {
			config.includeSaveControl = false;
		} else {
			config.includeSaveControl = true;
		}
		if (document.getElementById(element)) {
			this.elements.push(document.getElementById(element));
		} else if (document.getElementsByClassName(element).length) {
			this.elements = document.getElementsByClassName(element);
		}
		this.replaceElements(config);
	}

	this.replaceElements = function(config) {
		for (var i=0; i<this.elements.length; i++) {
			var can = document.createElement("canvas");
			can.width = config.width;
			can.height = config.height;
			can.style.margin = "0px !important";
			can.style.padding = "0px !important";
			var ctx = can.getContext("2d");
			var instance = {
				element : this.elements[i],
				canvas : can,
				context : ctx,
				clean : true,
				writing : false
			}
			instance.canvas.style.cursor = config.cursorIcon.join(",");
			instance.element.appendChild(instance.canvas);
			instance.context.lineWidth = config.penWidth;
			instance.context.strokeStyle = config.penColour;
			//fill the background ? 
			if (config.backgroundColour) {
				instance.context.fillStyle = config.backgroundColour;
				instance.context.fillRect(0,0,instance.canvas.width, instance.canvas.height);
				instance.context.stroke();
			}
			this.instances.push(instance);
			this.bindEvents(instance);
			this.setupControls(instance);
		}
	}

	this.bindEvents = function(instance) {
		var that =  this;
		instance.canvas.addEventListener("mousedown", function(e) {
			instance.writing = true;
			if (instance.clean) {
				instance.context.beginPath();
				instance.clean = false;
			}
			var x = instance.canvas.offsetLeft;
			var y = instance.canvas.offsetTop;
			instance.context.moveTo(((e.clientX+that.config.lineOffsetLeft)-x)+0.5, ((e.clientY+that.config.lineOffsetTop)-y)+0.5);
		});
		instance.canvas.addEventListener("touchstart", function(e) {
			instance.writing = true;
			if (instance.clean) {
				instance.context.beginPath();
				instance.clean = false;
			}
			var x = instance.canvas.offsetLeft;
			var y = instance.canvas.offsetTop;
			instance.context.moveTo(((e.pageX+that.config.lineOffsetLeft)-x)+0.5, ((e.pageY+that.config.lineOffsetTop)-y)+0.5);
		});
		instance.canvas.addEventListener("mouseup", function() {
			instance.writing = false;
		});
		instance.canvas.addEventListener("touchend", function() {
			instance.writing = false;
		});
		instance.canvas.addEventListener("mousemove", function(e) {
			if (!instance.writing) return false;
			var x = instance.canvas.offsetLeft;
			var y = instance.canvas.offsetTop;
			instance.context.lineTo(((e.clientX+that.config.lineOffsetLeft)-x)+0.5, ((e.clientY+that.config.lineOffsetTop)-y)+0.5);
			instance.context.clearRect(0,0,instance.canvas.width, instance.canvas.height);
			if (that.config.backgroundColour) {
				that.doBackground(that.config.backgroundColour, instance);
			}
			instance.context.stroke();
		});
		instance.canvas.addEventListener("touchmove", function(e) {
			if (!instance.writing) return false;
			e.preventDefault();
			var x = instance.canvas.offsetLeft;
			var y = instance.canvas.offsetTop;
			//are we still on the canvas
			if (e.pageX >= (x+instance.canvas.width) || e.pageY >= (y+instance.canvas.height)) {
				instance.writing = false;
				return false;
			}
			instance.context.lineTo(((e.pageX+that.config.lineOffsetLeft)-x)+0.5, ((e.pageY+that.config.lineOffsetTop)-y)+0.5);
			instance.context.clearRect(0,0,instance.canvas.width, instance.canvas.height);
			if (that.config.backgroundColour) {
				that.doBackground(that.config.backgroundColour, instance);
			}
			instance.context.stroke();
		});
		instance.canvas.addEventListener("mouseout", function() {
			instance.writing = false;
		});
		instance.canvas.addEventListener("blur", function() {
			instance.writing = false;
		});
		instance.canvas.addEventListener("focus", function() {
			instance.writing = false;
		});
	}

	this.doBackground = function(colour, instance) {
		instance.context.fillStyle = colour;
		instance.context.fillRect(0,0,instance.canvas.width, instance.canvas.height);
	}

	this.setupControls = function(instance) {
		var that = this;
		var clearer = document.createElement("button");
		clearer.appendChild(document.createTextNode("Reset"));
		clearer.addEventListener("click", function() {
			instance.context.clearRect(0,0,instance.canvas.width, instance.canvas.height);
			instance.clean = true;
			if (that.config.backgroundColour) {
				that.doBackground(that.config.backgroundColour, instance);
			}
		});
		instance.element.appendChild(clearer);
		if (!this.config.includeSaveControl) return false;
		var saver = document.createElement("button");
		saver.appendChild(document.createTextNode("Save"));
		instance.element.appendChild(saver);
		instance.saveControl = saver;
		saver.addEventListener("click", function() {
			that.saveImage(instance, that.config.imageSaveURL);
		});
	}

	this.saveImage = function(instance, saveURL) {
		instance.saveControl.firstChild.nodeValue = "Saving Signature";
		var dataToSave = instance.canvas.toDataURL();
		var xhr = new XMLHttpRequest || new ActiveXObject("Microsoft.XMLHTTP");
		xhr.open("POST", saveURL, false);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if (xhr.readyState==4 && xhr.status==200) {
				instance.saveControl.firstChild.nodeValue = "Saved";
			}
		}
		xhr.send("imgData="+dataToSave);
	}

	this.init(element, this.config);

}