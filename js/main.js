/* =========================================
   THE MULTIVERSE ENGINEER - MAIN JS
   ========================================= */

// Configuration for colors based on dimensions
const dimensionColors = {
    all: '220, 100%, 60%',   // Nexus Blue
    web: '200, 100%, 50%',   // Electric Blue
    ai: '270, 100%, 65%',    // Quantum Purple
    vr: '160, 100%, 45%'     // Holographic Cyan
};

/* --- Canvas Particle Portal --- */
const canvas = document.getElementById('portal-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let mouse = { x: null, y: null, radius: 150 };

// Setup Canvas Size
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

// Mouse Event
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        
        // Mouse repulsion
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= forceDirectionX * force * 2;
                this.y -= forceDirectionY * force * 2;
            }
        }
    }
    
    draw(colorHsl) {
        ctx.fillStyle = `hsla(${colorHsl}, 0.8)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

// Init Particles
function initParticles() {
    particlesArray = [];
    let numberOfParticles = (canvas.width * canvas.height) / 9000;
    if (numberOfParticles > 300) numberOfParticles = 300; // Cap
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}
initParticles();

// Animation Loop
function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get active dimension color from root CSS variable
    let activeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim();
    // Simple extraction if it is hsl(...)
    let colorVal = activeColor.replace('hsl(', '').replace(')', '');
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw(colorVal);
        
        // Connect close particles
        for (let j = i; j < particlesArray.length; j++) {
            let dx = particlesArray[i].x - particlesArray[j].x;
            let dy = particlesArray[i].y - particlesArray[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${colorVal}, ${1 - distance/100})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}
animateParticles();

/* --- Dimension Morphing (Filters) --- */
const filterBtns = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Active Button State
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        // Change Global Theme Accent Color
        document.documentElement.style.setProperty('--theme-accent', `hsl(${dimensionColors[filterValue]})`);
        
        // Filter Projects
        projects.forEach(project => {
            if (filterValue === 'all' || project.getAttribute('data-category') === filterValue) {
                project.style.display = 'block';
                setTimeout(() => {
                    project.style.opacity = '1';
                    project.style.transform = 'scale(1)';
                }, 50);
            } else {
                project.style.opacity = '0';
                project.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    project.style.display = 'none';
                }, 300); // match transition duration
            }
        });
    });
});

/* --- Dynamic Typing Text --- */
const typingText = document.getElementById('typing-text');
const words = [
    "Architect of Web & Cloud Spaces...",
    "Explorer of Machine Intelligence...",
    "Creator of Immersive Virtual Realities..."
];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeDelay = 100;

function typeEffect() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 50; // faster delete
    } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 100;
    }
    
    // Word completed
    if (!isDeleting && charIndex === currentWord.length) {
        typeDelay = 2000; // Pause at end of word
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        if (wordIndex >= words.length) {
            wordIndex = 0;
        }
        typeDelay = 500; // Pause before new word
    }
    
    setTimeout(typeEffect, typeDelay);
}
setTimeout(typeEffect, 2000); // Initial delay

/* --- Scroll Reveal & Skill Bars --- */
const reveals = document.querySelectorAll('.section-title, .about-text, .academics-panel, .timeline-item, .contact-info, .contact-form');
const skillBars = document.querySelectorAll('.skill-bar');

function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;
    
    // Generic reveals
    reveals.forEach(element => {
        const revealTop = element.getBoundingClientRect().top;
        if (revealTop < windowHeight - revealPoint) {
            element.classList.add('active');
            if(!element.classList.contains('reveal')) {
               element.classList.add('reveal', 'active');
            }
        }
    });
    
    // Skill bars animation
    skillBars.forEach(bar => {
        const revealTop = bar.getBoundingClientRect().top;
        if (revealTop < windowHeight - 50) {
            const fill = bar.querySelector('.bar-fill');
            const level = bar.getAttribute('data-level');
            fill.style.width = level + '%';
        }
    });
    
    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}
// Add base reveal class to all targets initially
reveals.forEach(el => el.classList.add('reveal'));
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Trigger once on load

/* --- Theme Toggler (Dark/Light) --- */
const themeBtn = document.getElementById('theme-toggle');
const icon = themeBtn.querySelector('i');

// Check local storage for theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
});

/* --- Mobile Menu --- */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-links a');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    
    // Animate hamburger
    if(mobileMenu.classList.contains('active')){
        hamburger.children[0].style.transform = 'rotate(-45deg) translate(-5px, 5px)';
        hamburger.children[1].style.opacity = '0';
        hamburger.children[2].style.transform = 'rotate(45deg) translate(-5px, -5px)';
    } else {
        hamburger.children[0].style.transform = 'none';
        hamburger.children[1].style.opacity = '1';
        hamburger.children[2].style.transform = 'none';
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.children[0].style.transform = 'none';
        hamburger.children[1].style.opacity = '1';
        hamburger.children[2].style.transform = 'none';
    });
});

/* --- Modal Functionality --- */
const modalOverlay = document.getElementById('modal-overlay');
const modals = document.querySelectorAll('.modal');
const closeBtns = document.querySelectorAll('.close-modal');

// Global attach function for index.html onclick
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modalOverlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modals.forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

modalOverlay.addEventListener('click', closeModal);

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

/* --- Contact Form Prevent Default --- */
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Transmission Successful';
    btn.style.background = 'hsl(160, 100%, 45%)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        e.target.reset();
    }, 3000);
});
