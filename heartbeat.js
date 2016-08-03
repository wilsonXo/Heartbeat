(function(window, document, undefined) {

	var _ = window.H = function(option) {
		return new _.fn.init(option);
	}

	var fn = _.fn = _.prototype,
		init = _.fn.init = function(option) {
			var queue = this.queue = [];
			this.opt = option;
			this.uuid = _.uuid();
			this.reset();
		}

	_.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	init.prototype = _.fn;

	_.extend = function(fns) {
		for (var i in fns) {
			this.prototype[i] = fns[i];
		}
	}

	_.extend({
		reset: function() {
			try {
				var channel = this.channel = new WebSocket(this.opt.host, 'dumb-increment-protocol');
				channel.onopen = this.open(this.opt);
				channel.onmessage = this.receive(this.opt);
				channel.onclose = this.opt.close;
				channel.onerror = this.error;
			} catch (e) {
				throw "failed to establish connection->host:" + this.opt.host;
			}
			return this.channel;
		},
		open: function(opt) {
			return function(res) {
				opt.open ? optn.open(res) : void(0);
			}
		},
		error: function(e) {
			throw "websocket channel disconnected,attempt to reconnect.";
		},
		send: function(data) {
			if (this.channel.readyState === 1) {
				var pack = typeof data === "object" ? JSON.stringify(data) : data;
				this.channel.send(pack);
			} else {
				this.queue.push(data);
				this.standby();
			}
		},
		getstatus: function() {
			return this.channel.readyState;
		},
		receive: function(opt) {
			var self = this;
			if (opt.receive) {
				return function(res) {
					opt.receive(res);
					if (opt.complete) {
						opt.complete.call(self);
					}
				}
			} else {
				self.channel.onmessage = opt
			}
		},
		standby: function() {
			var self = this;
			if (!self.wt) {
				self.wt = setInterval(function() {
					if (self.channel.readyState === 1) {
						for (var i in self.queue) self.send(self.queue[i]);
						self.queue = [];
						if (self.queue.length <= 0) {
							clearInterval(self.wt);
							self.wt = null;
						}
					} else if (self.channel.readyState === 3) {
						self.reset();
					}
				}, 500);
			}
		}
	}, _.fn);

	//export interface to loader that follow the AMD standard
	if (typeof define === "function" && define.amd) {
		define("H", [], function() {
			return _;
		});
	}

})(window, document);