window.onload = function() {
		var fileInput = document.getElementById('fileInput');
		var fileDisplayArea = document.getElementById('fileDisplayArea');

		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var reader = new FileReader();

			reader.onload = function(e) {
				//fileDisplayArea.innerText = reader.result;
				var string = reader.result;
				console.log(string);
				console.log("---");
				var splittedLines = string.split("\n");
				splittedLines.splice(0,1);	//Removes description line
				console.log(splittedLines[0]);
			}
			reader.readAsText(file);	
		});
}
