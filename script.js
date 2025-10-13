document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // OTIMIZAÇÃO: Precarregamento inteligente de imagens do slider
    // =================================================================
    const preloadSlideImages = () => {
        const slides = document.querySelectorAll('.slide img');
        
        slides.forEach((img, index) => {
            // Primeira imagem já tem loading="eager", então só marca como carregada
            if (index === 0) {
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.addEventListener('load', function() {
                        this.classList.add('loaded');
                    });
                }
            } else {
                // Precarrega a segunda imagem após 2 segundos
                // E a terceira após 4 segundos
                setTimeout(() => {
                    if (!img.complete) {
                        const preloadImg = new Image();
                        preloadImg.onload = () => img.classList.add('loaded');
                        preloadImg.src = img.src;
                    }
                }, index * 2000);
            }
        });
    };
    
    // =================================================================
    // LÓGICA DO SLIDER (COM RESET DE TIMING E PRELOAD)
    // =================================================================
    const sliderSection = document.getElementById('hero');
    if (sliderSection) {
        let currentIndex = 0;
        const slides = document.querySelector('.slides');
        let slideInterval;
        const totalSlides = document.querySelectorAll('.slide').length;

        // Precarrega a próxima imagem
        const preloadNextSlide = (index) => {
            const nextIndex = (index + 1) % totalSlides;
            const nextSlide = document.querySelectorAll('.slide')[nextIndex];
            const img = nextSlide.querySelector('img');
            
            if (img && !img.classList.contains('loaded') && !img.complete) {
                const preloadImg = new Image();
                preloadImg.onload = () => img.classList.add('loaded');
                preloadImg.src = img.src;
            }
        };

        const showSlide = (index) => {
            currentIndex = (index + totalSlides) % totalSlides;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Precarrega a próxima imagem
            preloadNextSlide(currentIndex);
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

        // Inicia o estado do slide, o timer e o precarregamento
        showSlide(currentIndex); // <-- ADICIONE ESTA LINHA
        startSlideTimer();
        preloadSlideImages();
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
    // ANIMAÇÃO DOS SERVICE ITEMS NO MOBILE (SCROLL HORIZONTAL)
    // =================================================================
    if (window.innerWidth <= 998) {
        const serviceItems = document.querySelectorAll('.service-item');
        
        if (serviceItems.length > 0) {
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

    // =================================================================
    // PERFORMANCE: Lazy loading de iframes (se houver no futuro)
    // =================================================================
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    if (lazyIframes.length > 0 && 'IntersectionObserver' in window) {
        const iframeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    iframe.src = iframe.dataset.src;
                    iframeObserver.unobserve(iframe);
                }
            });
        });
        
        lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
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

    // =================================================================
    // OTIMIZAÇÃO: Remove listeners de eventos não utilizados
    // =================================================================
    window.addEventListener('load', function() {
        // Remove loading spinners ou placeholders se houver
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.remove());
        
        // Log de performance (apenas em desenvolvimento)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (performance && performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Tempo de carregamento total: ${loadTime}ms`);
            }
        }
    });

    // =================================================================
    // DETECÇÃO DE CONEXÃO LENTA (OPCIONAL)
    // =================================================================
    if ('connection' in navigator && navigator.connection.effectiveType) {
        const connection = navigator.connection;
        
        // Se conexão for lenta (2g ou slow-2g), desabilita algumas animações
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
            document.documentElement.classList.add('slow-connection');
            console.log('Conexão lenta detectada. Otimizações aplicadas.');
        }
    }

    // =================================================================
    // PREVENÇÃO DE CLIQUES ACIDENTAIS DURANTE CARREGAMENTO
    // =================================================================
    const preventClicksDuringLoad = () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
        document.body.appendChild(overlay);
        
        window.addEventListener('load', () => {
            setTimeout(() => overlay.remove(), 100);
        });
    };
    
    // Executa apenas se a página estiver carregando
    if (document.readyState === 'loading') {
        preventClicksDuringLoad();
    }

});

// =================================================================
// SERVICE WORKER (CACHE OFFLINE) - OPCIONAL
// =================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
         navigator.serviceWorker.register('/sw.js')
             .then(reg => console.log('Service Worker registrado:', reg))
             .catch(err => console.log('Erro ao registrar Service Worker:', err));
    });
}