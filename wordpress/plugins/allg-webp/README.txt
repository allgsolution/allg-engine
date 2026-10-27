ALLG WebP 1.0.0 — GPL-2.0-or-later
WordPress 6.4+, PHP 7.4+, GD ou Imagick com suporte WebP.

INSTALAÇÃO
WordPress > Plugins > Adicionar plugin > Enviar plugin > allg-webp.zip > Ativar.
Não envie este ZIP como tema. Funciona independentemente do tema ativo.
Não exige chave de API e não envia suas imagens a terceiros.

NOVOS UPLOADS
JPEG e PNG passam a gerar versões redimensionadas em WebP, com qualidade 80.
O WordPress preserva o original e gera srcset para escolher tamanhos responsivos.
Imagens PNG mantêm transparência quando suportada pelo editor do servidor.
GIFs, SVGs, URLs externas e arquivos não redimensionados não são convertidos.
O arquivo original pode continuar JPEG/PNG, inclusive em conteúdo que usa tamanho completo.

BIBLIOTECA EXISTENTE
Faça backup. Deixe o tema atualizado ativo para registrar os novos tamanhos.
Ferramentas > ALLG WebP > Converter primeiro lote; depois Continue próximo lote
até a mensagem de conclusão. Cada clique examina até 5 JPEG/PNG, sem agendamento
em segundo plano. Evite exclusões na biblioteca durante a varredura.
Veja os contadores de sucesso/falha; originais ausentes ou imagens sem miniaturas
são reportados como falhas. Não significa que todas as imagens foram convertidas.
Miniaturas são recriadas usando os tamanhos atuais; recortes manuais podem mudar.
Originais e miniaturas antigas não são apagados: haverá consumo extra de disco.
O plugin não reescreve URLs nos artigos. Em artigos antigos, selecione novamente
imagens que ainda apontam diretamente para miniaturas JPEG/PNG, ou use seu fluxo
de edição/migração de conteúdo. Imagens de fundo e imagens externas exigem outro tratamento.
Limpe cache de página/CDN e valide a aba Rede do navegador e o PageSpeed novamente.

DESATIVAÇÃO
A desativação interrompe novas conversões. WebPs existentes e seus metadados
continuam disponíveis. O plugin não altera configurações do servidor ou CDN.

LIMITES
Otimização não garante uma nota específica do PageSpeed. Cache, anúncios,
latência da hospedagem, fontes, scripts e outros plugins afetam LCP e entrega.
Não configure simultaneamente dois conversores automáticos de imagens.
