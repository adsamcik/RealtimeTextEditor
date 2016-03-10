var ta = document.getElementById("textarea");


//ta.value = "Hey I am really here";
ta.focus();
//ta.selectionStart = 5;
ta.addEventListener("keydown", update);

var stack = [];
var previousStart;
var last;
var fileName = "data.txt";


document.getElementById("title").innerHTML = fileName;
promise.get(fileName, null, null).then(function (error, text, xhr) {
	ta.textContent = text;
});

function update(e) {
	var event = window.event ? window.event : e;
	console.log(event.keyCode);
	if (event.key == "Backspace") resolveBackspace(event.key);
	else if (isValidKey(event)) resolveNewKey(event.key);
}

function isValidKey(e) {
	var key = e.keyCode;
	if (e.ctrlKey || e.altKey)
		return false;
	return key != 16 && key != 17 && key != 18 && key != 20 && key != 37 && key != 38 && key != 39 && key != 40 && !(key >= 112 && key <= 123);
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

function resolveBackspace(key) {
	stack.push({
		value: key,
		start: ta.selectionStart,
		end: ta.selectionEnd
	});
}

function send() {
	if (stack.length > 0) {
		var xhr = {
			Accept: "application/json"
		};
		promise.post("resolveUpdate.php", {
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