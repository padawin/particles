(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d');

	const PARTICLE_STATES = {
		DEAD: 0,
		ALIVE: 1
	};
	const PARTICLE_RADIUS = 5;

	function Particle (position, speed, maxLife) {
		this.life = maxLife;
		this.maxLife = maxLife;
		this.position = position;
		this.speed = speed;
		this.state = PARTICLE_STATES.ALIVE;
	}

	Particle.prototype.update = function () {
		this.life--;

		if (this.life == 0) {
			this.state = PARTICLE_STATES.DEAD;
		}

		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	};

	Particle.prototype.draw = function () {
		var opacity = this.life / this.maxLife;
		canvasContext.fillStyle = 'rgba(123, 43, 109, ' + opacity + ')';
		canvasContext.beginPath();
		canvasContext.arc(this.position.x, this.position.y, PARTICLE_RADIUS, 0, 2 * Math.PI, true);
		canvasContext.fill();
	};
})();
