![image](https://github.com/user-attachments/assets/75ce6bbd-a8fe-4f2e-b90a-0f47021564ec)

## Índice:
- [Grupo](#grupo)
- [Introdução](#introdução)
- [Casos de Utilização](#casos-de-utilização)
- [Diagramas do Sistemas](#diagramas-do-sistemas)
- [Arquitetura da Solução](#arquitetura-da-solução)
- [Frontend](#frontend)
- [backend](#backend)
- [Componente de IA](#componente-de-ia)
- [Autenticação](#autenticação)
- [Base de Dados](#base-de-dados)
- [Componente de Inteligência Artificial](#componente-de-inteligência-artificial)
- [Segurança](#segurança)
- [Base de Dados](#base-de-dados)
- [Manual do Utilizador](#manual-do-utilizador)
- [Gestão do Projeto](#gestão-do-projeto)
- [Conclusão e Trabalho Futuro](#conclusão-e-trabalho-futuro)







10. Conclusão e Trabalho Futuro

# Grupo

- Pedro Dias - 20230038
- Leonardo Nguyen - 20230805
- Silésio - 20220618
- Fausto - 20210819


# Introdução
1.1 Contexto
A crescente oferta de eventos tecnológicos (conferências, meetups, workshops) torna
cada vez mais difícil para utilizadores encontrarem iniciativas relevantes de forma
rápida e eficaz. As plataformas tradicionais de eventos recorrem sobretudo a filtros
rígidos e pesquisas baseadas em palavras-chave, o que limita a expressividade da
intenção do utilizador e conduz frequentemente a resultados pouco relevantes.

1.2 Problema
Os utilizadores enfrentam dificuldades em encontrar eventos alinhados com os seus
interesses, disponibilidade temporal e contexto pessoal, devido a mecanismos de
pesquisa pouco flexíveis e à ausência de personalização.

1.3 Objetivos
O objetivo deste projeto é desenvolver uma plataforma web que permita:
• Descoberta inteligente de eventos tecnológicos;
• Pesquisa em linguagem natural suportada por Inteligência Artificial;
• Personalização da experiência do utilizador;
• Autenticação segura e gestão de perfis.

1.4 Visão Geral da Solução
A confAI é uma aplicação web que integra tecnologias modernas de frontend e backend,
combinadas com um componente de Inteligência Artificial (CSP) para interpretação
semântica de consultas em linguagem natural, autenticação via Clerk e uma arquitetura
escalável baseada em serviços.

# Casos de Utilização
Caso de Utilização Principal — Pesquisa Inteligente de Eventos
Ator: Utilizador autenticado
Objetivo: Encontrar eventos relevantes através de linguagem natural
Pré-condições: Utilizador autenticado via Clerk
Pós-condições: Lista de eventos relevantes apresentada ao utilizador
Fluxo Principal:
1. O utilizador insere uma consulta em linguagem natural.
2. O frontend valida a sessão do utilizador.
3. O backend envia a consulta ao componente de IA.
4. A IA interpreta a intenção e gera filtros estruturados.
5. O sistema executa uma pesquisa híbrida (semântica + filtros).
6. Os eventos são ordenados por relevância e apresentados.
Fluxo Alternativo:
Se a consulta for ambígua, o sistema solicita refinamento ao utilizador.

# Diagramas do Sistemas

