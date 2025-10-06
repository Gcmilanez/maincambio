document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DO SLIDER (COM RESET DE TIMING) ---
    const sliderSection = document.getElementById('hero');
    if (sliderSection) {
        let currentIndex = 0;
        const slides = document.querySelector('.slides');
        let slideInterval;
        const totalSlides = document.querySelectorAll('.slide').length;

        const showSlide = (index) => {
            currentIndex = (index + totalSlides) % totalSlides;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        };

        const startSlideTimer = () => {
            slideInterval = setInterval(() => {
                showSlide(currentIndex + 1);
            }, 10000);
        };

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

        startSlideTimer();
    }
    
    // --- LÓGICA DO MENU MOBILE ---
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => menu.classList.toggle('show'));
    }

    // --- VALIDAÇÃO E ENVIO DO FORMULÁRIO (VERSÃO ATUALIZADA) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        document.getElementById('name').addEventListener('input', function() { 
            this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, ''); 
        });
        document.getElementById('phone').addEventListener('input', function() { 
            this.value = this.value.replace(/\D/g, ''); 
        });

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            const formData = new FormData(this);

            fetch('enviar_email.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Houve um problema com a resposta do servidor.');
            })
            .then(successMessage => {
                alert(successMessage);
                this.reset();
            })
            .catch(error => {
                console.error('Erro ao enviar formulário:', error);
                alert('Não foi possível enviar sua mensagem. Por favor, tente novamente mais tarde.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
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
            themeToggle.checked = document.documentElement.classList.contains('dark-mode');
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

      if (window.innerWidth <= 998) {
        const serviceItems = document.querySelectorAll('.service-item');
        
        // Cria o observer para detectar quando o elemento está no centro
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Remove classe active de todos
              serviceItems.forEach(item => item.classList.remove('active'));
              // Adiciona classe active ao elemento no centro
              entry.target.classList.add('active');
            }
          });
        }, {
          root: null,
          rootMargin: '-45% 0px -45% 0px', // Detecta apenas quando está no centro
          threshold: 0
        });
        
        // Observa cada item de serviço
        serviceItems.forEach(item => {
          observer.observe(item);
        });
      }
    }
});