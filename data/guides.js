export const guides = [
  {
    id: "guia-bematech-mp-4200-th",
    titulo: "Como instalar Bematech MP-4200 TH",
    marca: "Bematech",
    modelo: "MP-4200 TH",
    categoria: "Impressora termica",
    driverRelacionadoId: "bematech-mp-4200-th",
    aplicativoRelacionadoId: "",
    descricao: "Guia detalhado para instalar o driver da impressora Bematech MP-4200 TH via USB ou rede.",
    keywords: ["bematech", "4200", "mp4200", "usb", "rede", "driver", "instalacao", "termica", "fiscal"],
    compatibilidade: ["Windows 11", "Windows 10 32-bit/64-bit", "Windows 8.1", "Windows 7"],
    observacoes: [
      "Execute o instalador como administrador.",
      "Confirme a porta correta antes de testar no sistema de venda."
    ],
    errosComuns: [
      {
        problema: "Pagina de teste nao imprime",
        solucao: "Verifique a porta USB/TCP selecionada, limpe a fila e reinicie o spooler."
      },
      {
        problema: "Impressora aparece offline",
        solucao: "Confirme energia, cabo, IP e desative o modo offline nas propriedades da impressora."
      }
    ],
    passos: [
      "Baixe o driver da Bematech MP-4200 TH no Download Center.",
      "Extraia o arquivo ZIP em uma pasta local.",
      "Execute o instalador como administrador.",
      "Selecione o modelo MP-4200 TH e a conexao usada.",
      "Configure a porta USB ou TCP/IP.",
      "Envie uma pagina de teste pelo Windows."
    ]
  },
  {
    id: "guia-epson-tm-t20x",
    titulo: "Como instalar Epson TM-T20X",
    marca: "Epson",
    modelo: "TM-T20X",
    categoria: "Impressora termica",
    driverRelacionadoId: "epson-tm-t20x",
    aplicativoRelacionadoId: "",
    descricao: "Guia para instalar Epson TM-T20X, configurar USB ou rede e validar impressao.",
    keywords: ["epson", "tm-t20x", "t20x", "usb", "rede", "ethernet", "driver", "instalacao"],
    compatibilidade: ["Windows 11", "Windows 10 32-bit/64-bit", "Windows Server 2022/2019/2016"],
    observacoes: [
      "Use o pacote Epson correto para o sistema operacional.",
      "Reinicie o sistema de venda apos a instalacao quando necessario."
    ],
    errosComuns: [
      {
        problema: "Porta Epson nao aparece",
        solucao: "Instale o pacote TMUSB/APD e reconecte a impressora."
      },
      {
        problema: "Texto desalinhado",
        solucao: "Revise largura de papel e preferencias do driver."
      }
    ],
    passos: [
      "Baixe o driver Epson TM-T20/TM-T20X.",
      "Execute o instalador como administrador.",
      "Selecione o modelo TM-T20X.",
      "Escolha USB, porta virtual ou TCP/IP.",
      "Finalize o assistente.",
      "Imprima uma pagina de teste."
    ]
  }
];
