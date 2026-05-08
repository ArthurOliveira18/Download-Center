import { guideReferences } from "@/data/guideReferences";
import { normalizeText } from "@/utils/search";
import { slugify } from "@/utils/slug";

export function buildInstallationGuide(driver) {
  const profile = getGuideProfile(driver);

  return {
    title: driver.guiaInstalacao?.titulo || `Como instalar ${driver.marca} ${driver.modelo}`,
    modelName: `${driver.marca} ${driver.modelo}`,
    summary: profile.summary,
    compatibility: driver.compatibilidade?.length ? driver.compatibilidade : profile.compatibility,
    prerequisites: profile.prerequisites,
    download: {
      label: driver.driver?.nome || "Driver",
      version: driver.driver?.versao || "Versao cadastrada",
      url: driver.driver?.downloadUrl
    },
    notices: [
      "Execute instaladores como administrador para permitir criacao de portas e filas no Windows.",
      "Antes de reinstalar, limpe filas paradas e confirme se nenhum sistema de venda esta usando a impressora.",
      "Em ambiente de producao, registre a porta final usada para facilitar suporte futuro."
    ],
    sections: [
      {
        id: "preparacao",
        title: "Preparacao antes de instalar",
        tone: "info",
        steps: profile.preparation
      },
      {
        id: "instalacao",
        title: "Instalacao passo a passo",
        tone: "default",
        steps: profile.installation
      },
      {
        id: "usb",
        title: "Configuracao via USB",
        tone: "success",
        steps: profile.usb
      },
      {
        id: "rede",
        title: "Configuracao em rede",
        tone: "warning",
        steps: profile.network
      },
      {
        id: "teste",
        title: "Teste de impressao",
        tone: "success",
        steps: profile.test
      }
    ],
    troubleshooting: profile.troubleshooting,
    mediaSlots: [
      {
        type: "image",
        title: "Imagem do instalador",
        description: "Espaco preparado para print da tela inicial do instalador."
      },
      {
        type: "image",
        title: "Configuracao de porta",
        description: "Espaco preparado para print de USB, COM ou TCP/IP."
      },
      {
        type: "video",
        title: "Video de instalacao",
        description: "Espaco preparado para tutorial em video do suporte."
      }
    ],
    references: getReferences(driver)
  };
}

function getGuideProfile(driver) {
  const brand = normalizeText(driver.marca);
  const model = normalizeText(driver.modelo);

  if (brand.includes("bematech")) {
    return bematechProfile(driver);
  }

  if (brand.includes("epson")) {
    return epsonProfile(driver);
  }

  if (brand.includes("elgin")) {
    return elginProfile(driver);
  }

  if (brand.includes("daruma")) {
    return darumaProfile(driver);
  }

  if (brand.includes("wch") || model.includes("ch34")) {
    return serialProfile(driver);
  }

  return genericProfile(driver);
}

function bematechProfile(driver) {
  return {
    summary:
      "Guia para instalar o spooler Bematech/Elgin Bematech no Windows, com foco em USB e possibilidade de configuracao Ethernet quando a interface estiver disponivel.",
    compatibility: ["Windows 11", "Windows 10 32-bit/64-bit", "Windows 8.1", "Windows 7"],
    prerequisites: [
      "Usuario do Windows com permissao de administrador.",
      "Cabo USB ou interface Ethernet instalada na impressora.",
      "Bobina colocada corretamente e impressora ligada.",
      "Driver correto para arquitetura do Windows, x86 ou x64."
    ],
    preparation: [
      "Confirme se a impressora esta ligada, com papel e sem luz de erro.",
      "Se for USB, conecte a impressora diretamente ao computador, evitando hubs.",
      "Se for rede, confirme se o computador e a impressora estao na mesma faixa de IP.",
      "Baixe o pacote do driver pelo botao desta pagina e extraia o arquivo antes de executar."
    ],
    installation: [
      "Abra a pasta extraida e execute o instalador como administrador.",
      "Quando o instalador abrir, selecione o modelo correto: " + driver.modelo + ".",
      "Escolha a interface usada pela impressora: USB para cabo local ou Ethernet para rede.",
      "Clique em instalar e aguarde o mapeamento do driver no Windows.",
      "Se o instalador parecer travado ou aparecer como nao respondendo, aguarde a finalizacao antes de fechar."
    ],
    usb: [
      "Use a opcao USB no instalador quando a impressora aparecer conectada.",
      "Se o Windows criar uma porta USB001/USB002, mantenha a porta indicada pelo instalador.",
      "Ao concluir, aceite a impressao de teste sugerida pelo driver.",
      "Se nao imprimir, troque a porta nas propriedades da impressora e teste novamente."
    ],
    network: [
      "Use Ethernet somente se a impressora tiver interface de rede instalada.",
      "Informe o IP da impressora no instalador ou localize o equipamento pela ferramenta do fabricante.",
      "Crie ou valide uma porta TCP/IP padrao no Windows apontando para o IP correto.",
      "Em redes novas, teste ping para o IP da impressora antes de reinstalar o driver."
    ],
    test: [
      "Abra Configuracoes do Windows > Bluetooth e dispositivos > Impressoras e scanners.",
      "Selecione a impressora instalada e abra as propriedades.",
      "Envie uma pagina de teste.",
      "Confirme se o cupom sai com corte, acentuacao e largura corretos."
    ],
    troubleshooting: commonPrinterIssues(driver)
  };
}

function epsonProfile(driver) {
  return {
    summary:
      "Guia para instalar impressoras Epson TM com Advanced Printer Driver, driver TMUSB quando necessario e validacao pelo Windows.",
    compatibility: ["Windows 11", "Windows 10 32-bit/64-bit", "Windows Server 2022/2019/2016", "Windows 8.1", "Windows 7"],
    prerequisites: [
      "Sistema operacional selecionado corretamente na pagina de suporte Epson.",
      "Pacote APD ou driver TMUSB adequado ao modelo.",
      "Permissao de administrador no Windows.",
      "Impressora ligada, com papel e cabo USB/rede funcional."
    ],
    preparation: [
      "Confira o modelo exato da impressora antes de baixar o pacote.",
      "Remova instalacoes antigas se houver conflito de porta ou fila presa.",
      "Baixe o driver pelo Download Center ou valide a versao no suporte Epson.",
      "Feche sistemas de PDV que possam estar usando a impressora."
    ],
    installation: [
      "Execute o instalador do driver Epson como administrador.",
      "Siga o assistente do Advanced Printer Driver.",
      "Selecione o modelo " + driver.modelo + " quando solicitado.",
      "Escolha USB, porta virtual ou TCP/IP conforme o tipo de conexao.",
      "Finalize a instalacao e reinicie o sistema de PDV se ele ja estava aberto."
    ],
    usb: [
      "Instale o driver antes de reconectar a impressora, se o Windows nao reconhecer corretamente.",
      "Use o driver TMUSB quando o dispositivo aparecer sem porta adequada.",
      "Confirme no Gerenciador de Dispositivos se nao ha alerta amarelo.",
      "Nas propriedades da impressora, confira se a porta Epson/USB esta selecionada."
    ],
    network: [
      "Configure o IP da impressora conforme a rede local.",
      "Crie uma porta TCP/IP no Windows apontando para o IP da impressora.",
      "Use porta 9100 quando o ambiente exigir impressao raw.",
      "Teste comunicacao por ping antes de alterar o driver."
    ],
    test: [
      "Envie uma pagina de teste pelo Windows.",
      "Valide tambem uma impressao real no sistema de venda.",
      "Confira largura do papel, corte e caracteres especiais.",
      "Se o texto sair desalinhado, revise tamanho de papel e driver selecionado."
    ],
    troubleshooting: commonPrinterIssues(driver)
  };
}

function elginProfile(driver) {
  return {
    summary:
      "Guia para instalar impressoras Elgin i7/i8/i9 com driver spooler, utilitario Elgin e configuracao de porta.",
    compatibility: ["Windows 11", "Windows 10 32-bit/64-bit", "Windows 8.1", "Windows 7"],
    prerequisites: [
      "Permissao de administrador.",
      "Driver spooler ou pacote Elgin correspondente ao modelo.",
      "Cabo USB, serial ou rede em bom estado.",
      "Bobina instalada e impressora ligada."
    ],
    preparation: [
      "Identifique o modelo no corpo da impressora: " + driver.modelo + ".",
      "Baixe e extraia o pacote do driver.",
      "Se for serial, anote a porta COM exibida pelo Windows.",
      "Se for rede, anote IP e porta TCP/IP usada pelo equipamento."
    ],
    installation: [
      "Execute o instalador do driver Elgin como administrador.",
      "Avance pelo assistente e selecione o modelo correto.",
      "Escolha a porta USB, COM ou TCP/IP conforme a conexao.",
      "Aguarde a criacao da impressora no spooler do Windows.",
      "Abra o Elgin Utility quando precisar validar comunicacao ou parametros."
    ],
    usb: [
      "Conecte a impressora e aguarde o Windows reconhecer o dispositivo.",
      "Se houver porta virtual, selecione a porta criada para a impressora.",
      "Se o driver nao encontrar a impressora, troque o cabo ou porta USB.",
      "Finalize enviando pagina de teste."
    ],
    network: [
      "Garanta que computador e impressora estejam na mesma rede.",
      "Configure porta TCP/IP com o IP da impressora.",
      "Use o utilitario Elgin para validar conexao quando disponivel.",
      "Se nao responder, revise IP, gateway e bloqueios de firewall."
    ],
    test: [
      "Verifique se a impressora aparece em Dispositivos e Impressoras.",
      "Envie pagina de teste do Windows.",
      "Teste tambem uma impressao curta pelo sistema usado na loja.",
      "Confirme corte e largura de bobina."
    ],
    troubleshooting: commonPrinterIssues(driver)
  };
}

function darumaProfile(driver) {
  return {
    summary:
      "Guia para instalar Daruma Serie 700/800, normalmente separando driver USB e driver spooler.",
    compatibility: ["Windows 11", "Windows 10 32-bit/64-bit", "Windows 8.1", "Windows 7"],
    prerequisites: [
      "Permissao de administrador.",
      "Driver USB Daruma e spooler do modelo.",
      "Impressora ligada e cabo conectado quando solicitado.",
      "Acesso ao Gerenciador de Dispositivos para validar porta."
    ],
    preparation: [
      "Extraia o pacote baixado antes de executar qualquer instalador.",
      "Localize primeiro o instalador do driver USB.",
      "Depois localize o instalador do spooler.",
      "Feche programas de venda durante a instalacao."
    ],
    installation: [
      "Execute o driver USB como administrador.",
      "Avance no assistente, aceite os termos e conclua.",
      "Quando o instalador solicitar, conecte a impressora ao computador.",
      "Em seguida execute o instalador do spooler como administrador.",
      "Conclua o assistente e crie a impressora no Windows."
    ],
    usb: [
      "Abra o Gerenciador de Dispositivos e veja se a porta Daruma aparece em Portas COM/LPT.",
      "Se a porta nao aparecer, reconecte o cabo e reinstale o driver USB.",
      "Associe a porta correta nas propriedades da impressora.",
      "Evite alternar portas USB depois da instalacao."
    ],
    network: [
      "Modelos Daruma podem variar por interface; confirme se a unidade possui Ethernet.",
      "Quando houver rede, configure IP fixo ou reserva DHCP.",
      "Crie uma porta TCP/IP no Windows apontando para o IP configurado.",
      "Teste conectividade antes de reinstalar o spooler."
    ],
    test: [
      "Envie pagina de teste pelo Windows.",
      "Se disponivel, execute a ferramenta Daruma para validar comunicacao.",
      "Teste impressao pelo sistema final.",
      "Confirme caracteres, corte e velocidade."
    ],
    troubleshooting: commonPrinterIssues(driver)
  };
}

function serialProfile(driver) {
  return {
    summary: "Guia para instalar adaptadores USB serial CH34x e validar a porta COM no Windows.",
    compatibility: ["Windows 11", "Windows 10", "Windows 8.1", "Windows 7"],
    prerequisites: [
      "Instalador CH341SER/CH34x adequado ao Windows.",
      "Permissao de administrador.",
      "Adaptador desconectado antes de iniciar, quando possivel.",
      "Acesso ao Gerenciador de Dispositivos."
    ],
    preparation: [
      "Baixe o instalador CH34x cadastrado no Download Center.",
      "Desconecte o adaptador USB serial.",
      "Feche softwares que estejam usando portas COM.",
      "Execute o instalador como administrador."
    ],
    installation: [
      "Clique em Install no instalador CH341SER/CH34x.",
      "Aguarde a mensagem de sucesso.",
      "Conecte novamente o adaptador USB.",
      "Abra o Gerenciador de Dispositivos e confirme a porta USB-SERIAL CH340/CH341.",
      "Anote a porta COM para usar no sistema ou na impressora."
    ],
    usb: [
      "Use uma porta USB direta do computador.",
      "Se a COM mudar ao trocar a porta fisica, atualize o sistema que usa essa comunicacao.",
      "Sem porta COM visivel, reinstale o driver e reinicie o computador.",
      "Evite cabos USB longos em ambiente de automacao."
    ],
    network: [
      "Este driver nao configura rede; ele cria comunicacao serial via USB.",
      "Para impressoras em rede, use o driver da impressora e nao o CH34x.",
      "Se o equipamento usa conversor serial para rede, configure o conversor separadamente.",
      "Documente a COM final usada pelo sistema."
    ],
    test: [
      "Veja a porta COM no Gerenciador de Dispositivos.",
      "Abra o sistema que usa serial e selecione a COM correta.",
      "Teste comunicacao com o equipamento conectado.",
      "Se falhar, revise baud rate, cabo e porta."
    ],
    troubleshooting: [
      {
        problem: "Porta COM nao aparece",
        cause: "Driver nao instalado, cabo ruim ou adaptador desconectado.",
        fix: "Reinstale o CH34x, reconecte o adaptador e confira Portas COM/LPT."
      },
      {
        problem: "Sistema nao comunica",
        cause: "COM incorreta ou baud rate diferente do equipamento.",
        fix: "Atualize a COM no sistema e valide os parametros seriais."
      }
    ]
  };
}

function genericProfile(driver) {
  return {
    summary: "Guia generico para drivers POS e impressoras termicas cadastradas no Download Center.",
    compatibility: ["Windows 11", "Windows 10", "Windows 8.1", "Windows 7"],
    prerequisites: [
      "Permissao de administrador.",
      "Arquivo do driver cadastrado.",
      "Modelo e largura de papel confirmados.",
      "Cabo USB, serial ou rede validado."
    ],
    preparation: driver.guiaInstalacao?.passos || [
      "Baixe o driver cadastrado.",
      "Extraia o arquivo se for ZIP, RAR ou 7Z.",
      "Confirme modelo, porta e largura de papel.",
      "Feche sistemas que possam estar usando a impressora."
    ],
    installation: [
      "Execute o instalador como administrador.",
      "Selecione o modelo mais proximo quando o driver for generico.",
      "Escolha a porta correta.",
      "Finalize e abra as propriedades da impressora.",
      "Ajuste tamanho de papel e preferencias de impressao."
    ],
    usb: [
      "Use USB001/USB002 quando o Windows criar porta USB local.",
      "Se a impressora criar porta COM, anote o numero exibido.",
      "Troque a porta nas propriedades caso a pagina de teste nao saia.",
      "Teste novamente depois de cada ajuste."
    ],
    network: [
      "Configure IP fixo ou reserva DHCP.",
      "Crie porta TCP/IP no Windows.",
      "Valide ping para o IP da impressora.",
      "Teste impressao pelo Windows e pelo sistema final."
    ],
    test: [
      "Envie pagina de teste.",
      "Imprima um cupom real do sistema.",
      "Valide largura, corte, acentuacao e QR Code.",
      "Documente a porta que funcionou."
    ],
    troubleshooting: commonPrinterIssues(driver)
  };
}

function commonPrinterIssues(driver) {
  return [
    {
      problem: "A pagina de teste nao imprime",
      cause: "Porta errada, cabo desconectado ou fila presa.",
      fix: "Confira a porta nas propriedades da impressora, limpe a fila e reinicie o spooler do Windows."
    },
    {
      problem: "Imprime caracteres estranhos",
      cause: "Driver incorreto, modo generico inadequado ou encoding diferente.",
      fix: `Reinstale usando o driver do modelo ${driver.modelo} e revise as preferencias de impressao.`
    },
    {
      problem: "Impressora aparece offline",
      cause: "USB instavel, IP alterado, equipamento desligado ou porta TCP/IP incorreta.",
      fix: "Valide energia, cabo, IP e desative uso offline nas propriedades da fila."
    },
    {
      problem: "Corte ou largura incorretos",
      cause: "Tamanho de papel ou configuracao de bobina diferente do modelo.",
      fix: "Ajuste largura do papel nas preferencias do driver e teste novamente."
    }
  ];
}

function getReferences(driver) {
  const brandSlug = slugify(driver.marca);
  const normalizedBrand = normalizeText(driver.marca);

  if (guideReferences[brandSlug]) {
    return guideReferences[brandSlug];
  }

  if (normalizedBrand.includes("bematech")) return guideReferences.bematech;
  if (normalizedBrand.includes("epson")) return guideReferences.epson;
  if (normalizedBrand.includes("elgin")) return guideReferences.elgin;
  if (normalizedBrand.includes("daruma")) return guideReferences.daruma;
  if (normalizedBrand.includes("wch")) return guideReferences.wch;

  return guideReferences.generico;
}
