(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		pm;

	function coordinatesInCanvas (coordinates) {
		return coordinates.x + PARTICLE_RADIUS > 0 &&
			coordinates.x - PARTICLE_RADIUS < canvas.width &&
			coordinates.y + PARTICLE_RADIUS > 0 &&
			coordinates.y - PARTICLE_RADIUS < canvas.height;
	}

	const PARTICLE_STATES = {
		DEAD: 0,
		ALIVE: 1
	};
	const PARTICLE_RADIUS = 5;
	const PARTICLES_NUMBER = 1000;

	function Particle (position, speed) {
		this.maxLife = parseInt(Math.random() * 100);
		this.life = this.maxLife;
		this.position = position;
		this.speed = speed;
		this.state = PARTICLE_STATES.ALIVE;
		this.color = [
			parseInt(Math.random() * 255),
			parseInt(Math.random() * 255),
			parseInt(Math.random() * 255)
		];
	}

	Particle.prototype.update = function () {
		if (this.state == PARTICLE_STATES.DEAD) {
			return;
		}

		this.life--;

		if (this.life == 0 || !coordinatesInCanvas(this.position)) {
			this.state = PARTICLE_STATES.DEAD;
		}

		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	};

	Particle.prototype.draw = function () {
		var opacity = this.life / this.maxLife;
		canvasContext.fillStyle = 'rgba(' + this.color.join(', ') + ', ' + opacity + ')';
		canvasContext.beginPath();
		canvasContext.arc(this.position.x, this.position.y, PARTICLE_RADIUS, 0, 2 * Math.PI, true);
		canvasContext.fill();
	};

	function ParticlesManager (size) {
		this.maxSize = size;
		this.particlesCollection = Array(size);
		this.nbParticles = 0;
	}

	ParticlesManager.prototype.addParticle = function () {
		if (this.nbParticles == this.maxSize) {
			return;
		}

		this.particlesCollection[this.nbParticles] = new Particle(
			{x: 150, y: 300}, {x: 1.5, y: 3}
		);
		this.nbParticles++;
	};

	ParticlesManager.prototype.updateAndDrawParticles = function () {
		var that = this;
		function swapParticles (i, j) {
			var tmp = that.particlesCollection[i];
			that.particlesCollection[i] = that.particlesCollection[j];
			that.particlesCollection[j] = tmp;
		}

		var i = 0;
		while (i < this.nbParticles) {
			this.particlesCollection[i].update();

			if (this.particlesCollection[i].state == PARTICLE_STATES.DEAD) {
				this.nbParticles--;
				swapParticles(i, this.nbParticles);
			}
			else {
				this.particlesCollection[i].draw();
				i++;
			}
		}
	};

	function refreshScreen () {
		canvasContext.fillStyle = '#ffffff';
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	}

	function updateAndDrawParticles () {
		pm.updateAndDrawParticles();
	}

	function mainLoop () {
		requestAnimationFrame(mainLoop);
		refreshScreen();
		updateAndDrawParticles();
	}

	pm = new ParticlesManager(PARTICLES_NUMBER);
	mainLoop();
})();
