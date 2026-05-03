# My Library

Uma aplicação React moderna para gerenciar, visualizar e ler livros digitais. Oferece uma interface intuitiva com suporte a temas (claro/escuro) e componentes reutilizáveis construídos com Chakra UI.

## ✨ Características

- 📚 Gerenciamento de biblioteca de livros
- 🌙 Suporte a modo claro e escuro (com next-themes)
- 🎨 Interface moderna com Chakra UI
- ⌨️ Componentes acessíveis
- 📱 Design responsivo
- ⚡ Performance otimizada com Vite

## 🛠️ Tecnologias Utilizadas

- **React** 19.2.5 - Biblioteca UI
- **TypeScript** 6.0.2 - Tipagem estática
- **Vite** 8.0.10 - Build tool e dev server
- **Chakra UI** 3.35.0 - Componentes UI
- **Next Themes** 0.4.6 - Gerenciamento de temas
- **React Icons** 5.6.0 - Ícones
- **Emotion** 11.14.0 - CSS-in-JS
- **ESLint** 10.2.1 - Linting
- **TypeScript ESLint** 8.58.2 - Linting TypeScript

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── atoms/              # Componentes básicos (botões, barras de progresso)
│   ├── molecules/          # Componentes compostos (cartões de livros, notas)
│   ├── organisms/          # Componentes complexos (painéis da aplicação)
│   └── ui/                 # Utilitários UI (temas, providers, tooltips)
├── pages/                  # Páginas da aplicação
├── utils/                  # Funções utilitárias
├── types/                  # Definições TypeScript
├── mocks/                  # Dados mock para desenvolvimento
├── assets/                 # Arquivos estáticos
└── main.tsx               # Ponto de entrada
```

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd my-library
```

2. Instale as dependências:
```bash
npm install
```

## 🚀 Como Rodar

### Desenvolvimento
Inicie o servidor de desenvolvimento com HMR (Hot Module Replacement):
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
Compila TypeScript e cria a build otimizada:
```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

### Preview da Build
Visualiza a versão de produção localmente:
```bash
npm run preview
```

### Lint
Verifica o código com ESLint:
```bash
npm run lint
```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run preview` | Visualiza a build de produção localmente |
| `npm run lint` | Executa o linting do código |

## 🎨 Temas

O projeto utiliza `next-themes` para gerenciar temas. Você pode alternar entre modo claro e escuro facilmente através do componente de controle de tema.
