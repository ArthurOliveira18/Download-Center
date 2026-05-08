# Download Center TAKEAT

Aplicacao Next.js com App Router para centralizar drivers, utilitarios, guias de instalacao, apps internos e tutoriais.

## Como rodar

```bash
npm install
npm run dev
```

URL local padrao:

```text
http://127.0.0.1:3000
```

## Variaveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto usando `.env.example` como base.

```env
ADMIN_USERNAME=admin@takeat.app
ADMIN_PASSWORD=sua-senha-local
ADMIN_NAME=Administrador TAKEAT
AUTH_SECRET=uma-chave-forte-com-32-caracteres-ou-mais
```

Arquivos `.env*.local` estao no `.gitignore` e nao devem ser enviados ao GitHub. Na Vercel, configure esses valores em Project Settings > Environment Variables.

## Estrutura principal

```text
app/                 Rotas do Next.js
components/          Componentes reutilizaveis
data/                Arrays de drivers, apps e tutoriais
hooks/               Hooks de interface, como debounce
lib/auth/            Sessao interna, cookie assinado e validacao de credenciais
services/            Leitura dos dados e verificacao simples de arquivos
utils/               Busca, normalizacao e helpers
public/drivers/      Arquivos publicos de drivers por fabricante
public/apps/         Aplicativos e utilitarios por fabricante
public/guias/        Pasta preparada para materiais estaticos de guias
```

## Area administrativa

Acesse:

```text
http://127.0.0.1:3000/admin
```

O painel permite cadastrar drivers com upload local. Ao enviar o formulario, o sistema:

- valida campos obrigatorios;
- evita duplicacao por marca/modelo;
- cria a pasta do fabricante em `public/drivers/`;
- salva o arquivo com nome padronizado;
- adiciona automaticamente um novo objeto no array `data/drivers.js`;
- cria a URL do guia em `/guias/{marca}/{modelo}`.

No ambiente local, os arquivos sao gravados dentro do projeto. Em hospedagens serverless como Vercel, a estrutura ja esta separada para futura troca do adaptador local por GitHub, S3, Firebase Storage, Cloudinary ou banco de dados.

## Regras de manutencao

Drivers e aplicativos internos sao protegidos:

- nao existe acao de deletar driver;
- nao existe campo para substituir o arquivo principal do driver;
- nao existe acao para alterar arquivos internos dos aplicativos;
- o funcionario pode editar apenas nome do driver, categoria, descricao, keywords e compatibilidade.

Guias possuem CRUD completo em `/admin`:

- criar guia;
- editar guia;
- deletar guia;
- adicionar, editar, remover e reordenar passos;
- cadastrar erros comuns de impressora no formato `Problema => Solucao`.

Tutoriais sao separados dos guias. Guias sao especificos por impressora/modelo; tutoriais sao conteudos tecnicos gerais sobre USB, rede, Ethernet, IP, drivers e erros comuns de impressora.

## Como adicionar um driver

Adicione um novo objeto em `data/drivers.js`:

```js
{
  id: "bematech-mp-4200-th",
  marca: "Bematech",
  modelo: "MP-4200 TH",
  categoria: "Impressora termica",
  descricao: "Driver da impressora termica Bematech MP-4200 TH para Windows.",
  keywords: ["bematech", "4200", "mp4200", "termica", "fiscal", "driver"],
  driver: {
    nome: "Driver Oficial",
    localPath: "C:/drivers/bematech/mp4200.zip",
    downloadUrl: "/drivers/bematech/mp4200.zip"
  },
  guiaInstalacao: {
    titulo: "Como instalar MP-4200 TH",
    url: "/guias/bematech/mp4200",
    passos: [
      "Baixe e extraia o pacote do driver.",
      "Execute o instalador como administrador.",
      "Conecte a impressora e selecione a porta correta."
    ]
  }
}
```

Depois coloque o arquivo em:

```text
public/drivers/bematech/mp4200.zip
```

Tambem e possivel cadastrar pelo painel interno em `/admin`, quando as variaveis de ambiente estiverem configuradas.

## Busca

A busca considera marca, modelo, categoria, descricao, nome do driver, versao e keywords. Ela normaliza acentos, faz busca parcial e pontua resultados mais proximos.

Exemplos que encontram o mesmo item:

```text
Bematech
4200
Bematech 4200 TH
driver bematech
```
