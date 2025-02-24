class Particle {
    constructor(canvas, mouse) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouse = mouse;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = 2;
        this.baseSize = this.size;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.distanceFromMouse = 0;
        this.connectionRadius = 150;
    }

    update() {
        // Mouvement
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebond sur les bords
        if (this.x > this.canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > this.canvas.height || this.y < 0) this.speedY *= -1;

        // Réaction améliorée à la souris
        if (this.mouse.x && this.mouse.y) {
            const dx = this.x - this.mouse.x;
            const dy = this.y - this.mouse.y;
            this.distanceFromMouse = Math.sqrt(dx * dx + dy * dy);

            if (this.distanceFromMouse < 100) {
                // Effet de répulsion
                const force = (100 - this.distanceFromMouse) / 100;
                const angle = Math.atan2(dy, dx);
                
                // Ajout d'une force de répulsion
                this.speedX += Math.cos(angle) * force * 0.5;
                this.speedY += Math.sin(angle) * force * 0.5;
                
                // Augmentation de la taille
                this.size = this.baseSize * (3 - (this.distanceFromMouse / 100));
                
                // Limitation de la vitesse
                const maxSpeed = 4;
                const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
                if (currentSpeed > maxSpeed) {
                    this.speedX = (this.speedX / currentSpeed) * maxSpeed;
                    this.speedY = (this.speedY / currentSpeed) * maxSpeed;
                }
            } else {
                // Retour progressif à la taille normale
                this.size = this.baseSize;
                
                // Ralentissement progressif
                this.speedX *= 0.99;
                this.speedY *= 0.99;
            }
        }
    }

    draw(particles) {
        // Dessiner les connexions
        particles.forEach(particle => {
            const dx = this.x - particle.x;
            const dy = this.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.connectionRadius) {
                let opacity = 1 - (distance / this.connectionRadius);
                
                // Augmenter l'opacité près de la souris
                if (this.mouse.x && this.mouse.y) {
                    const mouseDistance = Math.sqrt(
                        (this.x - this.mouse.x) * (this.x - this.mouse.x) +
                        (this.y - this.mouse.y) * (this.y - this.mouse.y)
                    );
                    if (mouseDistance < 100) {
                        opacity *= 2;
                    }
                }
                
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(220, 220, 220, ${opacity * 0.3})`;
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(this.x, this.y);
                this.ctx.lineTo(particle.x, particle.y);
                this.ctx.stroke();
            }
        });

        // Dessiner le point
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(220, 220, 220, 0.8)';
        this.ctx.fill();
    }
}

class Background {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numberOfParticles = 80;
        this.maxParticles = 200; // Nombre maximum de particules
        this.mouse = { x: undefined, y: undefined };
        
        this.setupCanvas();
        this.setupEventListeners();
        this.init();
        this.animate();
    }

    setupCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        });

        // Ajouter l'événement de clic
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Ajouter 5 nouvelles particules à la position du clic
            if (this.particles.length < this.maxParticles) {
                for (let i = 0; i < 5; i++) {
                    const particle = new Particle(this.canvas, this.mouse);
                    // Positionner la particule au point de clic
                    particle.x = clickX;
                    particle.y = clickY;
                    // Donner une vitesse aléatoire plus élevée au départ
                    particle.speedX = (Math.random() - 0.5) * 4;
                    particle.speedY = (Math.random() - 0.5) * 4;
                    this.particles.push(particle);
                }
            }
        });

        // Ajouter un effet de double-clic pour réduire le nombre de particules
        this.canvas.addEventListener('dblclick', () => {
            // Réduire de moitié le nombre de particules
            this.particles = this.particles.slice(0, Math.max(this.numberOfParticles, this.particles.length / 2));
        });
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    init() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas, this.mouse));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fond semi-transparent pour l'effet de traînée
        this.ctx.fillStyle = 'rgba(120, 120, 120, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update();
        });

        // Dessiner les particules après avoir mis à jour toutes les positions
        this.particles.forEach(particle => {
            particle.draw(this.particles);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialiser l'animation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new Background();
}); 