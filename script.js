document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DO SLIDER (COM RESET DE TIMING) ---
    let currentIndex = 0;
    const slides = document.querySelector('.slides');
    if (slides) {
        let slideInterval; // Variável para guardar o ID do nosso temporizador
        const totalSlides = document.querySelectorAll('.slide').length;

        const showSlide = (index) => {
            currentIndex = (index + totalSlides) % totalSlides;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        };

        // Função que inicia o temporizador automático
        const startSlideTimer = () => {
            slideInterval = setInterval(() => {
                showSlide(currentIndex + 1);
            }, 10000); // 10 segundos
        };

        // Função que reseta o temporizador
        const resetSlideTimer = () => {
            clearInterval(slideInterval); 
            startSlideTimer(); 
        };

        document.querySelector('.next').addEventListener('click', () => {
            showSlide(currentIndex + 1);
            resetSlideTimer(); 
        });

        document.querySelector('.prev').addEventListener('click', () => {
            showSlide(currentIndex - 1);
            resetSlideTimer(); 
        });

        // Inicia o temporizador pela primeira vez quando a página carrega
        startSlideTimer();
    }
    
    // --- LÓGICA DO MENU MOBILE ---
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => menu.classList.toggle('show'));
    }

    // --- VALIDAÇÃO E ENVIO DO FORMULÁRIO ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        document.getElementById('name').addEventListener('input', function() { this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, ''); });
        document.getElementById('phone').addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = this.name.value.trim();
            const email = this.email.value.trim();
            const phone = this.phone.value.trim();
            const mensagem = this.message.value.trim();
            const subject = encodeURIComponent(`Contato de ${nome}`);
            const body = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\nTelefone: ${phone}\n\nMensagem:\n${mensagem}`);
            const mailtoUrl = `mailto:giovanni.milanez@gmail.com?subject=${subject}&body=${body}`;
            window.open(mailtoUrl);
            alert('Seu cliente de email foi aberto com a mensagem. Basta clicar em "Enviar" para concluir o contato.');
            this.reset();
        });
    }

    // --- ANIMAÇÃO DOS TÍTULOS DA SEÇÃO AO ROLAR ---
    const headings = document.querySelectorAll('section h2');
    if (headings.length > 0) {
        const observerOptions = { root: null, threshold: 0.1 };
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        headings.forEach(h2 => { observer.observe(h2); });
    }

    // --- LÓGICA DO MODO ESCURO (DARK MODE) ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        function syncThemeButtonState() {
            if (document.documentElement.classList.contains('dark-mode')) {
                themeToggle.checked = true;
            } else {
                themeToggle.checked = false;
            }
        }
        syncThemeButtonState();
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                syncThemeButtonState();
            }
        });
    }
});