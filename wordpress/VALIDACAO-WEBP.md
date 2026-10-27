# Validação local

WordPress 6.8, PHP 8.3, GD com suporte WebP, banco SQLite do WordPress Playground.

61 verificações passaram: geração de miniaturas WebP de JPEG/PNG, preservação da transparência e dos originais, HTML responsivo com srcset, reconversão repetida, arquivo ausente, servidor sem editor compatível, controles administrativos, bloqueio de acesso sem autorização, rejeição de nonce inválido e processamento autorizado de um lote.

Sintaxe PHP verificada em 11 arquivos e JavaScript do tema validado. ZIPs verificados por CRC.

Não houve acesso ao WordPress de produção nem nova medição do PageSpeed do site. As condições da hospedagem e o cache devem ser validados após instalar e converter a biblioteca.

## Aparência e compartilhamento — tema 1.2.0

Além das 61 verificações de imagens, passaram 17 verificações de compartilhamento no WordPress 6.8/PHP 8.3 e 20 verificações com Chromium em desktop (1440 px) e celular (390 px).

Verificados: links com título acentuado e URL codificados, isolamento de nova aba, Pinterest condicionado à imagem destacada, ocultação em artigos protegidos por senha, cópia do link, alternativa quando a área de transferência é negada, menu nativo de compartilhamento, navegação e links sem JavaScript, ausência de overflow horizontal nos cenários testados, WebP/srcset/prioridade alta na imagem de destaque e ausência de requisições a SDKs sociais ou fontes remotas.

Sintaxe de 10 arquivos PHP do tema e dos dois scripts JavaScript verificada. CSS: 10.271 bytes (3.273 bytes gzip); compartilhamento: 1.401 bytes (588 bytes gzip), carregado apenas em artigos. O servidor precisa habilitar compressão HTTP para entregar os tamanhos gzip. A quantidade de recursos de terceiros instalada no WordPress pode variar; os testes isolam os recursos do tema.

O visual usa apenas CSS e fontes do sistema, sem baixar a imagem de referência. Não foi feita uma nova medição do PageSpeed em produção; as verificações locais não garantem o mesmo LCP ou nota na hospedagem do usuário.
