
// CONFIGURAÇÕES DO GITHUB
const username = 'gabrielpsnmonteiro1-gif';

const projectsContainer = document.getElementById('projects-container');
const btnLoadMore = document.getElementById('btn-load-more');

// Projetos que aparecem primeiro
const projetosDestaque = [
    // 'nome-do-repositorio'
];

// Projetos que não aparecem no portfólio
const projetosIgnorados = [
    'gabrielpsnmonteiro1-gif.github.io'
];

// Descrições personalizadas
const projectDescriptions = {
    // 'nome-do-repositorio': 'Minha descrição'
};

let todosProjetos = [];
let projetosExibidos = 0;

const itensPorPagina = 8;

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {

    const githubLink = document.getElementById('github-profile-link');

    if (githubLink) {
        githubLink.href = `https://github.com/${username}`;
    }

    const yearSpan = document.getElementById('current-year');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    fetchGitHubProjects();
    initNavbarObserver();
    initMobileNavClose();

    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', exibirMaisProjetos);
    }
});

// PROTEÇÃO PARA TEXTOS RECEBIDOS DA API
function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caractere => {
        const entidades = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entidades[caractere];
    });
}

// CRIAÇÃO DOS CARDS
function renderCard(repo) {

    if (!projectsContainer) return;

    const title = repo.name;
    const desc = repo.description;
    const repoLink = repo.html_url;
    const language = repo.language;
    const hasPages = repo.has_pages;

    const finalDesc =
        projectDescriptions[title] ||
        desc ||
        'Nenhuma descrição fornecida no repositório.';

    const cardCol = document.createElement('div');

    cardCol.className = 'col-md-6 col-lg-4';

    let botoesAcao = '';

    if (hasPages) {

        const pagesLink = `https://${username}.github.io/${title}/`;

        botoesAcao = `
            <div class="d-flex gap-2">
                <a href="${escaparHTML(pagesLink)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-green btn-sm flex-fill">

                    <i class="fas fa-external-link-alt me-1"></i>
                    Ver Demo
                </a>

                <a href="${escaparHTML(repoLink)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-outline-custom btn-sm flex-fill">

                    <i class="fab fa-github me-1"></i>
                    Código
                </a>
            </div>
        `;

    } else {

        botoesAcao = `
            <div>
                <a href="${escaparHTML(repoLink)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-outline-custom btn-sm w-100">

                    <i class="fab fa-github me-1"></i>
                    Ver Código
                </a>
            </div>
        `;
    }

    cardCol.innerHTML = `
        <div class="custom-card p-4 d-flex flex-column justify-content-between h-100">

            <div>
                <div class="d-flex justify-content-between align-items-center mb-3">

                    <i class="fas fa-folder-open text-success fs-4"></i>

                    <span class="badge bg-dark border border-secondary text-muted font-mono small">
                        ${hasPages ? 'GitHub Pages' : 'Apenas Código'}
                    </span>
                </div>

                <h3 class="h5 fw-bold mb-2 text-break">
                    ${escaparHTML(title)}
                </h3>

                <p class="text-secondary small mb-3">
                    ${escaparHTML(finalDesc)}
                </p>
            </div>

            <div>
                <div class="d-flex flex-wrap gap-1 mb-3">

                    <span class="tech-badge">
                        ${escaparHTML(language || 'Diversos')}
                    </span>

                    <span class="tech-badge">GitHub</span>
                </div>

                ${botoesAcao}
            </div>
        </div>
    `;

    projectsContainer.appendChild(cardCol);
}

// BOTÃO CARREGAR MAIS
function exibirMaisProjetos() {

    const proximoLimite = projetosExibidos + itensPorPagina;

    const arrayParaExibir = todosProjetos.slice(
        projetosExibidos,
        proximoLimite
    );

    arrayParaExibir.forEach(repo => {
        renderCard(repo);
    });

    projetosExibidos += arrayParaExibir.length;

    if (btnLoadMore) {

        if (projetosExibidos >= todosProjetos.length) {
            btnLoadMore.classList.add('d-none');
        } else {
            btnLoadMore.classList.remove('d-none');
        }
    }
}

// BUSCA PROJETOS DO GITHUB
async function fetchGitHubProjects() {

    if (!projectsContainer) return;

    projectsContainer.innerHTML = `
        <div class="col-12 text-center text-secondary py-4">
            <i class="fas fa-spinner fa-spin me-2"></i>
            Carregando projetos...
        </div>
    `;

    try {

        let repos = [];
        let pagina = 1;
        let continuar = true;

        while (continuar) {

            const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${pagina}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const dados = await response.json();

            repos = repos.concat(dados);

            continuar = dados.length === 100;
            pagina++;
        }

        // Remove repositórios ignorados e forks
        repos = repos.filter(repo =>
            !projetosIgnorados.includes(repo.name) &&
            !repo.fork
        );

        // Organiza os projetos destacados
        repos.sort((a, b) => {

            const indexA = projetosDestaque.indexOf(a.name);
            const indexB = projetosDestaque.indexOf(b.name);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return new Date(b.updated_at) - new Date(a.updated_at);
        });

        todosProjetos = repos;
        projetosExibidos = 0;

        projectsContainer.innerHTML = '';

        if (todosProjetos.length === 0) {

            projectsContainer.innerHTML = `
                <div class="col-12 text-center text-muted py-4">
                    Nenhum projeto encontrado no momento.
                </div>
            `;

            if (btnLoadMore) {
                btnLoadMore.classList.add('d-none');
            }

            return;
        }

        exibirMaisProjetos();

    } catch (error) {

        console.error('Erro ao buscar projetos:', error);

        projectsContainer.innerHTML = `
            <div class="col-12 text-center text-danger py-4">

                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>

                <p>
                    Não foi possível carregar os projetos do GitHub.
                </p>

                <p class="small text-secondary">
                    Verifique sua conexão e tente novamente.
                </p>
            </div>
        `;
    }
}

// NAVEGAÇÃO ATIVA
function initNavbarObserver() {

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const id = entry.target.getAttribute('id');

                navLinks.forEach(link => {

                    link.classList.remove('active', 'text-success');

                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active', 'text-success');
                    }
                });
            }
        });

    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// FECHAR MENU MOBILE
function initMobileNavClose() {

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    const navbarCollapse = document.getElementById('navbarNav');

    if (!navbarCollapse) return;

    navLinks.forEach(link => {

        link.addEventListener('click', () => {

            if (typeof bootstrap === 'undefined') return;

            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);

            if (bsCollapse) {
                bsCollapse.hide();
            }
        });
    });
}
