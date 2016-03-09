var ta = document.getElementById("textarea");


//ta.value = "Hey I am really here";
ta.focus();
ta.selectionStart = 5;
ta.addEventListener("keydown", update);

var stack = [];
var previousStart;

function update(e) {
	var event = window.event ? window.event : e;
	if (event.key == "Backspace") resolveBackspace(event.key);
	else resolveNewKey(event.key);
}

function resolveNewKey(key) {
	if (stack.length > 0 && ta.selectionStart == ++previousStart)
		stack[stack.length - 1].value += key;
	else
		stack.push({ value: key, start: ta.selectionStart });
	previousStart = ta.selectionStart;
}

function resolveBackspace(key) {
	stack.push({ value: key, start: ta.selectionStart, end: ta.selectionEnd });
}

function send() {
	if (stack.length > 0) {
		var xhr = { Accept: "application/json" };
		promise.post("resolveUpdate.php", {data: JSON.stringify(stack)}, xhr).then(
			function (error, text, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				console.log(text);
			}
			);
		stack.length = 0;
	}
}

function recieve() {

}

setInterval(send, 1000);