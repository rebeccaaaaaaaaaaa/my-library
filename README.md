# My Library

Aplicação de leitura de PDFs com biblioteca pessoal persistente, anotações, marcadores e ferramentas de acompanhamento de leitura. Toda a experiência roda no navegador, sem backend necessário.

---

## Funcionalidades

### Biblioteca pessoal
- Upload de arquivos PDF diretamente do dispositivo
- Armazenamento local via IndexedDB (sem limite de tamanho imposto pela aplicação)
- Metadados persistidos no localStorage (título, autor, progresso, data de adição)
- Busca por título na barra da biblioteca
- Filtro entre todos os livros e apenas favoritos
- Marcar e desmarcar livros como favoritos
- Excluir livros da biblioteca com remoção completa dos dados armazenados
- Indicador visual de progresso de leitura em cada cartão da biblioteca

### Leitor de PDF
- Renderização de alta fidelidade via react-pdf e pdfjs-dist
- Navegação por página: setas do teclado, teclas PageDown/PageUp, campo de página direta e scroll
- Controle de zoom de 50% a 200% em incrementos de 10%
- Brilho do leitor ajustável de 70% a 130% via slider de iluminação
- Seleção de tema claro ou escuro diretamente no leitor
- Transições suaves entre páginas com efeito fade
- Retomada automática da última página lida ao reabrir um livro

### Anotacoes
- Criacao de notas livres vinculadas a paginas especificas
- Visualizacao rapida das duas ultimas notas com expansao para ver todas
- Exclusao individual de notas
- Atalho de navegacao direto para a pagina da nota

### Marcadores
- Adicao de marcadores com nome personalizado
- Visualizacao dos tres marcadores mais recentes com expansao para ver todos
- Exclusao individual de marcadores
- Atalho de navegacao direto para a pagina do marcador

### Destaque de texto
- Selecao de texto diretamente no conteudo do PDF
- Previa do trecho selecionado no painel lateral
- Criacao de nota a partir do destaque com um clique
- Destaque armazenado junto ao livro para referencia futura
- Explicacao com IA para o trecho selecionado (MVP)

### Metas e acompanhamento de leitura
- Configuracao de meta diaria de paginas por livro
- Contador de sequencia de dias com leitura ativa
- Indicador de paginas restantes para cumprir a meta do dia
- Previsao de data de conclusao calculada com base no ritmo medio real de leitura

---

## Tecnologias

| Tecnologia | Versao | Papel |
|---|---|---|
| React | 19.2.5 | Interface e gerenciamento de estado |
| TypeScript | 6.0.2 | Tipagem estatica |
| Vite | 8.0.10 | Build tool e servidor de desenvolvimento |
| react-pdf / pdfjs-dist | 10.4.1 / 5.4.296 | Renderizacao de PDFs |
| Chakra UI | 3.35.0 | Componentes de interface |
| next-themes | 0.4.6 | Alternancia de tema claro/escuro |
| react-icons | 5.6.0 | Icones |
| IndexedDB | nativo | Armazenamento binario dos PDFs |
| localStorage | nativo | Persistencia dos metadados |

---

## Deploy & Integração Contínua

O projeto está configurado com um pipeline automatizado de qualidade e deploy:

- **GitHub Actions**: A cada push ou pull request, um workflow valida a qualidade do código via `npm run lint` e compila a versão de produção com `npm run build`.
- **Netlify**: Após o sucesso do CI na branch `main`, a aplicação é automaticamente deployada em produção, garantindo que atualizações vão ao ar sem intervenção manual.
- **SPA Redirects**: Configuração automática para Single Page Application, com fallback para `index.html` em todas as rotas.

Resultado: código testado, build validado e versão nova em produção em minutos, sem downtime.

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── atoms/        # Botoes e barras de progresso
│   ├── molecules/    # Cartoes de livro, notas e marcadores
│   ├── organisms/    # Paineis esquerdo, central e direito
│   └── ui/           # Provider de tema, toaster, tooltip
├── pages/            # Pagina principal (Home) e estilos globais
├── types/            # Definicoes TypeScript (LibraryBook, ReaderNote, etc.)
├── utils/            # Persistencia (IndexedDB, localStorage) e helpers
├── mocks/            # Dados de desenvolvimento
└── main.tsx          # Ponto de entrada
```

---

## Instalacao e Uso

```bash
# Instalar dependencias
npm install

# Servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Build de producao
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## Configuracao de IA (MVP)

Para habilitar o botao "Explicar com IA" no painel de anotacoes, crie um arquivo `.env` na raiz do projeto com:

```bash
VITE_OPENAI_API_KEY=sua_chave_aqui
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

Observacoes:
- Sem `VITE_OPENAI_API_KEY`, a funcionalidade exibe mensagem de configuracao ausente.
- Este MVP chama a API diretamente do cliente. Para producao, o ideal e mover a chamada para um backend/proxy.
