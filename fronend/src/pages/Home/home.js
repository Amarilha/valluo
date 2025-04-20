document.getElementById('cta-button').addEventListener('click', function() {
    window.location.href = '../Auth';
});

document.getElementById('experimente-button').addEventListener('click', function() {
    window.location.href = '../calculadora';
});

 // Criação de partículas dinâmicas
 document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.getElementById('particles-js');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Tamanho aleatório entre 2px e 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posição aleatória
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Cor aleatória entre as cores de destaque
        const colors = ['#C792EA', '#80DEEA', '#FF80AB'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Atraso e duração da animação aleatórios
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
    }
});