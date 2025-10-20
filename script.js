document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // LÓGICA DE CARREGAMENTO DAS IMAGENS DO SLIDER (MÉTODO ROBUSTO)
    // =================================================================
    const initSliderImages = () => {
            const slideImages = document.querySelectorAll('.slide img');
            
            slideImages.forEach(imgNode => {
                // Para cada tag <img> no HTML, verificamos seu estado.
                
                // Se o navegador já a carregou (por estar em cache, por exemplo),
                // simplesmente adicionamos a classe para torná-la visível.
                if (imgNode.complete) {
                    imgNode.classList.add('loaded');
                } else {
                    // Se o navegador ainda não a carregou (provavelmente por estar fora da tela),
                    // nós forçamos o carregamento em segundo plano.
                    const tempImage = new Image();
                    tempImage.onload = function() {
                        // Quando a imagem temporária terminar de carregar,
                        // nós adicionamos a classe 'loaded' à imagem REAL no slider,
                        // tornando-a finalmente visível.
                        imgNode.classList.add('loaded');
                    };
                    // Ao definir o 'src', o navegador inicia o download da imagem.
                    tempImage.src = imgNode.src;
                }
            });
        };
        
    // =================================================================
    // LÓGICA DO SLIDER
    // =================================================================
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

        // Inicia o carregador de imagens, o estado do slide e o timer
        initSliderImages();
        showSlide(currentIndex);
        startSlideTimer();
    }
    
    // =================================================================
    // LÓGICA DO MENU MOBILE
    // =================================================================
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => menu.classList.toggle('show'));
        
        // Fecha o menu ao clicar em um link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                }
            });
        });
    }

    // =================================================================
    // VALIDAÇÃO E ENVIO DO FORMULÁRIO (OTIMIZADO)
    // =================================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Validação em tempo real
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        
        if (nameInput) {
            nameInput.addEventListener('input', function() { 
                this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, ''); 
            });
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('input', function() { 
                this.value = this.value.replace(/\D/g, ''); 
            });
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            // Desabilita o botão para evitar múltiplos envios
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            submitButton.style.opacity = '0.6';

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
                submitButton.style.opacity = '1';
            });
        });
    }

    // =================================================================
    // ANIMAÇÃO DOS TÍTULOS DA SEÇÃO AO ROLAR (OTIMIZADA)
    // =================================================================
    const headings = document.querySelectorAll('section h2');
    if (headings.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = { 
            root: null, 
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px' // Ativa um pouco antes de aparecer
        };
        
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target); // Para de observar após animar
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        headings.forEach(h2 => observer.observe(h2));
    }

    // =================================================================
    // LÓGICA DO MODO ESCURO (DARK MODE)
    // =================================================================
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
    }

    // =================================================================
    // SCROLL SUAVE PARA LINKS INTERNOS (FALLBACK)
    // =================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Ignora # sozinho
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Fecha o menu mobile se estiver aberto
                if (menu && menu.classList.contains('show')) {
                    menu.classList.remove('show');
                }
                
                // Scroll suave
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

});

// =================================================================
// SERVICE WORKER (CACHE OFFLINE)
// =================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
         navigator.serviceWorker.register('/sw.js')
             .then(reg => console.log('Service Worker registrado:', reg))
             .catch(err => console.log('Erro ao registrar Service Worker:', err));
    });
}