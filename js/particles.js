class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1; // Taille variable des particules
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = this.getRandomColor(); // Couleur aléatoire
    }

    getRandomColor() {
        const colors = [
            'rgba(255, 51, 51, 0.8)',  // Rouge
            'rgba(204, 204, 204, 0.8)', // Gris clair
            'rgba(169, 169, 169, 0.8)', // Gris moyen
            'rgba(255, 255, 255, 0.8)'  // Blanc
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Ajout d'un effet de lueur
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    update(mouse) {
        if (mouse.x && mouse.y) {  // Vérifie si la souris est sur le canvas
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {  // Distance de répulsion
                const force = (100 - distance) / 100;
                const directionX = dx / distance;
                const directionY = dy / distance;
                
                // Inverse la direction pour créer l'effet de répulsion
                this.x -= directionX * force * 5;
                this.y -= directionY * force * 5;
            }
        }
        
        // Retour à la position d'origine
        const dx = this.baseX - this.x;
        const dy = this.baseY - this.y;
        
        this.x += dx * 0.05;
        this.y += dy * 0.05;
    }
}

function initParticles() {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let particlesArray = [];
    let numberOfParticles = (canvas.width * canvas.height) / 6000;
    const mouse = {
        x: null,
        y: null,
        radius: 100
    };

    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
    }

    canvas.addEventListener('mousemove', (event) => {
        let rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particlesArray.forEach(particle => {
            particle.draw(ctx);
            particle.update(mouse);
        });
        
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        particlesArray = [];
        numberOfParticles = (canvas.width * canvas.height) / 6000;
        for (let i = 0; i < numberOfParticles; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            particlesArray.push(new Particle(x, y));
        }
    });
}

document.addEventListener('DOMContentLoaded', initParticles); 