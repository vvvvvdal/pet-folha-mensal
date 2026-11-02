# Componentes de interface adaptados

`src/components/ui/access-controls.tsx` adapta Frame, FrameHeader, FramePanel e
SegmentedControl dos arquivos `frame.tsx` e `segmented-control.tsx` do
[Frequência Hub](https://github.com/vvvvvdal/frequencia-hub), usados aqui como
fonte local. As adaptações do Hub têm origem em [coss ui](https://coss.com/ui),
licença MIT, crédito coss.com / Cal.com e contribuidores. A implementação no
PET usa elementos HTML nativos, tokens existentes e controles de 44 px.

O [Unslop de Damir](https://github.com/heydamir/unslop/blob/a6f121eee5f29c2f74976b75456feae8b66afb3a/skills/unslop/SKILL.md),
CC BY 4.0, orienta a retirada de promoção e prévia fictícia na entrada; referências
canônicas em `oracle-ci-logs-unslop.md`. Nenhum pacote desse catálogo foi instalado.

## Aviso MIT

Copyright (c) 2026 Felipe Gonçalves Vidal, Eduardo Fraga Pereira, Rafael José de Souza Marques (Frequência Hub).
Crédito dos componentes coss ui: coss.com / Cal.com e contribuidores.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Refinamento de 05/10/2026

Blob Card foi baixado novamente do registro público Unlumen. A composição conserva
cabeçalho fluido, conteúdo estável e borda de brilho no plano anual. Os auxiliares
FluidBlobs/GlowEffect continuam substituídos por SVG/CSS local com animação finita.
ASCII Flow usa o algoritmo adaptado existente, com deslocamento de 7px, período
de 4,8 segundos e pausas por visibilidade. Avatares de integrantes seguem a forma
circular com fallback de iniciais do [coss Avatar](https://coss.com/ui/docs/components/avatar),
reutilizando MemberAvatar. As fotos da equipe são arquivos fornecidos pelo mantenedor,
otimizados localmente em WebP. Nenhuma dependência foi acrescentada nesta revisão.
