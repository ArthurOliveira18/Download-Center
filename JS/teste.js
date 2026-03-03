const tutorialData = {
    daruma800: `
        <div class="tutorial-content">
            <h3>Tutorial de Instalação - Daruma DR800</h3>
            <hr>
            <h4>Passo 1: Download</h4>
            <p>Baixe o driver do Daruma DR800 na área de Downloads > Drivers.</p>
            
            <h4>Passo 2: Preparação</h4>
            <p>Desconecte a impressora do computador antes de iniciar a instalação.</p>
            
            <h4>Passo 3: Instalação</h4>
            <ul>
                <li>Execute o arquivo baixado como Administrador</li>
                <li>Aceite os termos de licença</li>
                <li>Escolha o diretório de instalação (recomendado manter o padrão)</li>
                <li>Clique em "Instalar" e aguarde a conclusão</li>
            </ul>
        </div>
    `,
    daruma700: `
        <div class="tutorial-content">
            <h3>Tutorial de Instalação - Daruma DR700</h3>
            <hr>
            <p>Conecte o equipamento e utilize o assistente de instalação Daruma para configurar as portas virtuais.</p>
        </div>
    `,
    bematech4200: `
        <div class="tutorial-content">
            <h3>Tutorial Bematech MP 4200 TH</h3>
            <hr>
            <p>Certifique-se de instalar o driver de Spooler para que a impressora apareça nos Dispositivos e Impressoras do Windows.</p>
        </div>
    `,
    framework: `
        <div class="tutorial-content">
            <h3>Instalação Daruma Framework</h3>
            <hr>
            <p>Extraia os arquivos e registre as DLLs necessárias para a comunicação com o PDV.</p>
        </div>
    `
};

const buttons = document.querySelectorAll('.tutorial-btn');
const viewer = document.getElementById('viewer');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        viewer.innerHTML = tutorialData[id];
        buttons.forEach(btn => btn.classList.remove('active-btn'));
        button.classList.add('active-btn');
    });
});