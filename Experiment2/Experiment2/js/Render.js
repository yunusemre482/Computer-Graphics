class Render{
	constructor(callback){
		var self = this;
		this.currentFrame = null;
		this.callBack = callback;

		this.run = function(){
			var currentFrame = performance.now();
			self.callBack(currentFrame);
			window.requestAnimationFrame(self.run);
		};
	}

	start(){
		this.currentFrame = performance.now();
		window.requestAnimationFrame(this.run);
		return this;
	}
}