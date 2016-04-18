(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		pm,
		canons = [],
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

	function ParticleCanon (position, angle) {
		this.position = position;
		this.angle = angle;
		this.minAngle = angle - Math.PI / 4;
		this.maxAngle = angle + Math.PI / 4;
		this.angularSpeed = Math.PI / 100;
		this.isFiring = false;
		this.reloadingTime = 0;
	}

	ParticleCanon.prototype.update = function () {
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

	ParticleCanon.prototype.draw = function () {
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

	ParticleCanon.prototype.setFire = function (isFiring) {
		this.isFiring = isFiring;
	};

	ParticleCanon.prototype.fire = function () {
		// the particle leaves at 35px from the center of the canon
		var distanceFromCanonCenter = 35,
			particleSpeed = 5,
			cosAngle = Math.cos(this.angle),
			sinAngle = Math.sin(this.angle),
			particlePosition = {
				x: this.position.x + distanceFromCanonCenter * cosAngle,
				// y goes towards the bottom of the screen
				y: this.position.y - distanceFromCanonCenter * sinAngle
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

	function updateAndDrawCanons () {
		for (var c = 0; c < canons.length; c++) {
			canons[c].update();
			canons[c].draw();
		}
	}

	function mainLoop () {
		requestAnimationFrame(mainLoop);
		refreshScreen();
		updateAndDrawParticles();
		updateAndDrawCanons();
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

		canons.push(new ParticleCanon(
			{x:mouseX, y: mouseY},
			Math.random() * 2 * Math.PI
		));
	};

	document.getElementById('fire-canons').onclick = function () {
		for(var c in canons) {
			canons[c].setFire(true);
		}
	};

	document.getElementById('stop-fire-canons').onclick = function () {
		for(var c in canons) {
			canons[c].setFire(false);
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
