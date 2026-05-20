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

Configure estas variaveis no ambiente do servidor. Em desenvolvimento local, elas tambem podem ficar em `.env.local`.

```env
ADMIN_USERNAME=seu-email-admin
ADMIN_PASSWORD=sua-senha-segura
ADMIN_NAME=Nome do administrador
AUTH_SECRET=uma-chave-secreta-segura
```

`ADMIN_USER`, `ADMIN_EMAIL`, `SESSION_SECRET` e `JWT_SECRET` continuam aceitos apenas como compatibilidade com configuracoes antigas. Arquivos `.env*.local` estao no `.gitignore` e nao devem ser enviados ao GitHub.

## Estrutura principal

```text
app/                 Rotas do Next.js
app/api/             API backend para auth, downloads, guias e tutoriais
components/          Componentes reutilizaveis
data/json/           Persistencia em JSON para downloads, guias e tutoriais
hooks/               Hooks de interface, como debounce
lib/auth/            Sessao interna, cookie assinado e validacao de credenciais
services/            Regras de negocio, repositorios JSON e verificacao de arquivos
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

O painel permite cadastrar drivers e aplicativos internos com upload separado do cadastro. Ao enviar o formulario, o sistema:

- valida campos obrigatorios;
- evita duplicacao por marca/modelo;
- envia o arquivo para o storage configurado antes de salvar os metadados;
- persiste o cadastro em `data/json/downloads.json`;
- cria a URL do guia em `/guias/{marca}/{modelo}`.

No ambiente local, se o Supabase nao estiver configurado, os arquivos podem ser gravados dentro do projeto por uma rota de upload separada. Em producao, configure o Supabase Storage e mantenha as credenciais somente nas variaveis de ambiente da plataforma.

## Regras de manutencao

Drivers e aplicativos internos sao protegidos:

- nao existe acao de deletar driver;
- nao existe campo para substituir o arquivo principal do driver;
- nao existe acao para alterar arquivos internos dos aplicativos;
- o funcionario pode editar apenas nome do driver, versao, descricao, keywords, compatibilidade e guia vinculado.

Guias possuem CRUD completo em `/admin`:

- criar guia;
- editar guia;
- deletar guia;
- adicionar, editar, remover e reordenar passos;
- cadastrar erros comuns de impressora no formato `Problema => Solucao`.

Tutoriais sao separados dos guias. Guias sao especificos por impressora/modelo; tutoriais sao conteudos tecnicos gerais sobre USB, rede, Ethernet, IP, drivers e erros comuns de impressora.

## Como adicionar um driver manualmente

Adicione um novo objeto em `drivers` dentro de `data/json/downloads.json`:

```js
{
  id: "bematech-mp-4200-th",
  marca: "Bematech",
  modelo: "MP-4200 TH",
  categoria: "Impressora termica",
  descricao: "Driver da impressora termica Bematech MP-4200 TH para Windows.",
  keywords: ["bematech", "4200", "mp4200", "termica", "driver"],
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

A busca considera marca, modelo, descricao, nome do driver, versao e keywords. Ela normaliza acentos, faz busca parcial e pontua resultados mais proximos.

Exemplos que encontram o mesmo item:

```text
Bematech
4200
Bematech 4200 TH
driver bematech
```
