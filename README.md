# Heartbeat
A simple webscoket lib on browser.
Example
```javascript

var channel = H({
	host: "ws://YOURHOST:PORT",
	receive: function(msg) {
		//the argument response from backend.
	}
});
```
1
