function getFilePath() {
	var url = window.location.href;
	var indexOf = url.indexOf('#', 0);
	if (indexOf + 1 == url.length)
		return null;
	return decodeURI(url.substr(indexOf + 1, url.length - indexOf));
}

function getFileNameFromPath(path) {
	return path.replace(/^.*[\\\/]/, '');
}

var ta = document.getElementById("textarea");
ta.disabled = true;
var stack = [];
var previousStart;
var last;
var filePath = getFilePath();

if (filePath === null) {
	document.getElementById("title").innerHTML = "No file entered";
} else {
	ta.focus();
	ta.addEventListener("keydown", update);
	document.getElementById("title").innerHTML = getFileNameFromPath(filePath);
	promise.get(filePath, null, null).then(function (error, text, xhr) {
		if (error === false)
			ta.textContent = text;
		ta.disabled = false;
	});
}

function update(e) {
	var event = window.event ? window.event : e;
	console.log(event.keyCode);
	if (event.keyCode === 0)
		return;
	if (event.key === "Backspace" || event.key === "Delete") resolveBackspace(event.key);
	else if (event.key === "Tab") resolveNewKey(resolveTab(event));
	else if (event.key === "Enter") resolveNewKey('\r\n');
	else if (isValidKey(event)) resolveNewKey(event.key);
}

function isValidKey(e) {
	var key = e.keyCode;
	if (e.ctrlKey || e.altKey)
		return false;
	return !(key >= 16 && key <= 20) && !(key >= 33 && key <= 40) && !(key >= 112 && key <= 123) && key != 144 && key != 45 && key != 46 && key != 91 && key != 27 && key != 145;
}

function resolveNewKey(key) {
	if (stack.length > 0 && ta.selectionStart == ++previousStart)
		stack[stack.length - 1].value += key;
	else
		stack.push({
			value: key,
			start: ta.selectionStart,
			end: ta.selectionEnd
		});
	previousStart = ta.selectionStart;
}

function resolveTab(e) {
	var tabVal = "\t";
	var start = ta.selectionStart;
	ta.value = ta.value.substring(0, start) + tabVal + ta.value.substr(ta.selectionEnd);
	ta.selectionStart = ta.selectionEnd = start + 1;
	e.preventDefault();
	return tabVal;
}

function resolveBackspace(key) {
	var start = ta.selectionStart;
	var end = ta.selectionEnd;
	if (key === "Delete" && start === end) {
		console.log(ta.value.length + " vs " + start);
		if (ta.value.length === start)
			return;
		start = end = start + 1;
		key = "Backspace";
	}

	stack.push({
		value: key,
		start: start,
		end: end
	});
}

function send() {
	if (stack.length > 0) {
		var xhr = {
			Accept: "application/json"
		};
		promise.post("resolveUpdate.php", {
			file: filePath,
			data: JSON.stringify(stack),
			last: last
		}, xhr).then(
			function (error, text, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				var json = JSON.parse(text);
				if (json.time != null)
					last = json.time;

				if (typeof json.data === 'string' || json.data.length === 0)
					return;

				var text = ta.textContent;
				for (var i = 0; i < json.data.length; i++) {
					var data = json.data[i];
					console.log(data.value);
					var count = data.end - data.start;
					if (data.value == "Backspace") {
						if (count == 0)
							text = text.substr(data.start - 1, 1);
						else
							text = text.substr(data.start, count);
					} else {
						//echo "value:" . $item["value"] . "start" . $item["start"];
						text = text.slice(0, data.start) + data.value + text.slice(data.end, text.length - data.end);
					}
					console.log(text);
				}
				ta.value = text;
				console.log(json);
			}
		);
		stack.length = 0;
	}
}


setInterval(send, 1000);