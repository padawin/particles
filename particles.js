(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		pm,
		cannons = [],
		spriteBoard,
		spriteBoardUrl = 'sprite.png';

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

		if (this.life <= 0 || !coordinatesInCanvas(this.position)) {
			this.state = PARTICLE_STATES.DEAD;
		}

		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	};

	Particle.prototype.draw = function () {
		var particleLife = this.life / this.maxLife,
			spriteIndex;
		if (particleLife >= 0.5) spriteIndex = 0;
		else if (particleLife >= 0.5) spriteIndex = 1;
		else if (particleLife >= 0.25) spriteIndex = 2;
		else if (particleLife >= 0.125) spriteIndex = 3;
		else spriteIndex = 4;
		canvasContext.drawImage(spriteBoard,
			spriteIndex * 10, 0,
			10, 10,
			this.position.x - 5, this.position.y - 5,
			10, 10
		);
	};

	function ParticlesManager (size) {
		this.maxSize = size;
		this.particlesCollection = Array(size);
		this.nbParticles = 0;
	}

	ParticlesManager.prototype.addParticle = function (position, speed) {
		if (this.nbParticles == this.maxSize) {
			return;
		}

		this.particlesCollection[this.nbParticles] = new Particle(
			position, speed
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

	function ParticleCannon (position, angle) {
		this.position = position;
		this.angle = angle;
		this.minAngle = angle - Math.PI / 4;
		this.maxAngle = angle + Math.PI / 4;
		this.angularSpeed = Math.PI / 100;
		this.isFiring = false;
		this.reloadingTime = 0;
	}

	ParticleCannon.prototype.update = function () {
		this.angle = this.angle + this.angularSpeed;

		if (this.angle < this.minAngle || this.angle > this.maxAngle) {
			this.angularSpeed *= -1;
		}

		if (this.reloadingTime > 0) {
			this.reloadingTime--;
		}
		else if (this.isFiring && !this.reloadingTime) {
			this.fire();
		}
	};

	ParticleCannon.prototype.draw = function () {
		canvasContext.save();
		canvasContext.translate(this.position.x, this.position.y);
		canvasContext.rotate(-this.angle);
		canvasContext.drawImage(spriteBoard,
			0, 10,
			55, 24,
			-15, -12,
			55, 24
		);
		canvasContext.restore();
	};

	ParticleCannon.prototype.setFire = function (isFiring) {
		this.isFiring = isFiring;
	};

	ParticleCannon.prototype.fire = function () {
		// the particle leaves at 35px from the center of the cannon
		var distanceFromCannonCenter = 35,
			particleSpeed = 5,
			cosAngle = Math.cos(this.angle),
			sinAngle = Math.sin(this.angle),
			particlePosition = {
				x: this.position.x + distanceFromCannonCenter * cosAngle,
				// y goes towards the bottom of the screen
				y: this.position.y - distanceFromCannonCenter * sinAngle
			},
			particleSpeedVector = {
				x: particleSpeed * cosAngle,
				y: -particleSpeed * sinAngle
			};

		pm.addParticle(particlePosition, particleSpeedVector);
		this.reloadingTime = 5;
	}

	function refreshScreen () {
		canvasContext.fillStyle = '#ffffff';
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	}

	function updateAndDrawParticles () {
		pm.updateAndDrawParticles();
	}

	function updateAndDrawCannons () {
		for (var c = 0; c < cannons.length; c++) {
			cannons[c].update();
			cannons[c].draw();
		}
	}

	function mainLoop () {
		requestAnimationFrame(mainLoop);
		refreshScreen();
		updateAndDrawParticles();
		updateAndDrawCannons();
	}

	function loadResources (callback) {
		spriteBoard = new Image();
		spriteBoard.onload = function () {
			callback();
		};
		spriteBoard.src = spriteBoardUrl;
	}

	canvas.onclick = function (event) {
		var rect = canvas.getBoundingClientRect(),
			root = document.documentElement,
			mouseX = event.clientX - rect.left - root.scrollLeft,
			mouseY = event.clientY - rect.top - root.scrollTop;

		cannons.push(new ParticleCannon(
			{x:mouseX, y: mouseY},
			Math.random() * 2 * Math.PI
		));
	};

	document.getElementById('fire-cannons').onclick = function () {
		for(var c in cannons) {
			cannons[c].setFire(true);
		}
	};

	document.getElementById('stop-fire-cannons').onclick = function () {
		for(var c in cannons) {
			cannons[c].setFire(false);
		}
	};

	pm = new ParticlesManager(PARTICLES_NUMBER);
	loadResources(mainLoop);

	window.addEventListener('resize', resizeCanvas, false);

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resizeCanvas();
})();
