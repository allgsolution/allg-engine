# Tema 1.2.0 + plugin WebP

1. Faça backup do WordPress (banco e uploads).
2. Atualize o tema em **Aparência > Temas > Adicionar novo > Enviar tema** com `allg-editorial.zip`. Confirme a substituição do tema existente apenas se não houver alterações próprias nos arquivos do tema; use um tema filho para personalizações.
3. Instale `allg-webp.zip` em **Plugins > Adicionar plugin > Enviar plugin** e ative.
4. Em **Ferramentas > ALLG WebP**, verifique suporte WebP e processe os lotes de imagens antigas até concluir. Qualidade WebP: 80; originais preservados.
5. Limpe caches do WordPress/CDN e repita o PageSpeed móvel. Verifique se as imagens dos cards são `.webp` e se o navegador escolhe tamanhos adequados.

O tema 1.1.0 inclui tamanhos 400×250, 600×375 e 800×500 para os cards, atributo `sizes` adaptado ao layout e prioridade alta para a imagem principal. Os novos tamanhos de imagens antigas só existirão após a conversão/regeneração. O WordPress mantém dimensões intrínsecas, `srcset` e carregamento adiado nos cards secundários.

O plugin gera versões redimensionadas WebP; não substitui todos os originais, URLs no conteúdo antigo, imagens externas ou fundos em CSS. Sem suporte WebP no GD/Imagick, informa a limitação e mantém uploads normais. Nenhuma configuração de cache da hospedagem é alterada.

## Aparência e redes sociais

O tema 1.2.0 usa tons de creme, rosa e vinho e títulos serifados com fontes locais. Dados do site e configurações existentes são preservados. Uma cor de destaque já escolhida continua valendo; para usar a paleta vinho, escolha `#8a2143` no Personalizador.

Após atualizar, limpe o cache para receber o novo CSS e JavaScript. Artigos exibem compartilhamento após o conteúdo em WhatsApp, Facebook, Telegram, X, e-mail e Pinterest (quando há imagem destacada). Copiar link e Mais opções são melhorias progressivas. Não é necessário instalar outro plugin de redes sociais. O plugin ALLG WebP continua funcionando sem atualização.
