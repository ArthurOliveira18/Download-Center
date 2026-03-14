const dadosDosTutoriais = {
    configuracaoBalanca: `
    <div class="conteudo-tutorial">
        <h3>Tutorial de Configuração de Balança</h3>
        <hr>
        
        <h4>Passo 1: Verificação Inicial</h4>
        <p>Verifique o modelo da balança (Modelos integrados: Prix 3 Fit / Prix Fi) e certifique-se de que os cabos estão conectados corretamente.</p>
        
        <h4>Passo 2: Cabos Necessários</h4>
        <ul>
            <li><strong>Cabo RJ45 a DB9 macho:</strong> Conectado à porta da balança e ao DB9 macho.</li>
            <li><strong>Cabo DB9 fêmea a DB9 fêmea:</strong> Adaptador para conectar ao computador.</li>
            <li><strong>Cabo DB9 fêmea a USB:</strong> Necessário apenas se o computador não possuir porta serial.</li>
        </ul>
        <h4>Passo 3: Configuração da Porta Serial</h4>
        <p>Acesse as configurações da balança e garanta que ela esteja definida como <strong>SERIAL</strong> (se aparecer USB na tela C13, pressione LIGA/DESLIGA para alterar).</p>
        
        <h4>Passo 4: Identificação no Windows</h4>
        <p>Pressione <strong>Win + R</strong>, digite <code>devmgmt.msc</code> e localize a balança em "Portas (COM e LPT)". Ela aparecerá como "USB-SERIAL CH340" ou algo semelhante.</p>
        <h4>Passo 5: Teste com Hércules</h4>
        <p>Abra o utilitário Hércules, acesse a aba <strong>Serial</strong>, configure a Porta COM identificada, Baud Rate (geralmente 4800) e clique em <strong>Open</strong> para verificar se o peso está sendo recebido.</p>
        <h4>Passo 6: Configuração no Dashboard</h4>
        <p>No Dashboard, acesse o menu <strong>Balanças</strong>, clique em "Nova Balança" e preencha:</p>
        <ul>
            <li><strong>Nome:</strong> Identificação de sua preferência.</li>
            <li><strong>Porta:</strong> A porta COM identificada no Passo 4.</li>
            <li><strong>Baud Rate:</strong> 4800.</li>
            <li><strong>Bit Rate:</strong> 8.</li>  
        </ul>
        
        <h4>Passo 7: Finalização</h4>
        <p>Vincule a balança aos usuários em "Ver Mais > Usuários" e certifique-se de que o aplicativo de impressão antigo esteja logado para enviar o peso ao sistema.</p>
    </div>
`,
    daruma800: `
        <div class="conteudo-tutorial">
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
        <div class="conteudo-tutorial">
            <h3>Tutorial de Instalação - Daruma DR700</h3>
            <hr>
            <p>Conecte o equipamento e utilize o assistente de instalação Daruma para configurar as portas virtuais.</p>
        </div>
    `,
    bematech4200: `
        <div class="conteudo-tutorial">
            <h3>Tutorial Bematech MP 4200 TH</h3>
            <hr>
            <p>Certifique-se de instalar o driver de Spooler para que a impressora apareça nos Dispositivos e Impressoras do Windows.</p>
        </div>
    `,
    framework: `
        <div class="conteudo-tutorial">
            <h3>Instalação Daruma Framework</h3>
            <hr>
            <p>Extraia os arquivos e registre as DLLs necessárias para a comunicação com o PDV.</p>
        </div>
    `
};

// Seleção de elementos traduzidos
const botoes = document.querySelectorAll('.botao-tutorial');
const visualizador = document.getElementById('visualizador');

botoes.forEach(botao => {
    botao.addEventListener('click', () => {
        // Obtém o ID do atributo data
        const id = botao.getAttribute('data-id');

        // Atualiza o conteúdo do visualizador
        visualizador.innerHTML = dadosDosTutoriais[id];

        // Remove a classe ativa de todos os botões e adiciona ao clicado
        botoes.forEach(btn => btn.classList.remove('botao-ativo'));
        botao.classList.add('botao-ativo');
    });
});