<?php
/**
 * Plugin Name: ALLG WebP
 * Description: Gera versões WebP responsivas de JPEG e PNG, preservando os originais. Conversão da biblioteca em lotes em Ferramentas > ALLG WebP.
 * Version: 1.0.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: ALLG
 * License: GPL-2.0-or-later
 * Text Domain: allg-webp
 */
if (!defined('ABSPATH')) { exit; }

function allgw_supported() {
    return wp_image_editor_supports(array('mime_type' => 'image/webp'));
}
function allgw_formats($formats) {
    if (allgw_supported()) {
        $formats['image/jpeg'] = 'image/webp';
        $formats['image/png'] = 'image/webp';
    }
    return $formats;
}
add_filter('image_editor_output_format', 'allgw_formats');
function allgw_quality($quality, $mime_type) {
    return 'image/webp' === $mime_type ? 80 : $quality;
}
add_filter('wp_editor_set_quality', 'allgw_quality', 10, 2);
function allgw_menu() {
    add_management_page('ALLG WebP', 'ALLG WebP', 'manage_options', 'allg-webp', 'allgw_page');
}
add_action('admin_menu', 'allgw_menu');
function allgw_page() {
    if (!current_user_can('manage_options')) { return; }
    $offset = isset($_GET['offset']) ? absint($_GET['offset']) : 0;
    ?>
    <div class="wrap"><h1>ALLG WebP</h1>
    <p>Novos uploads JPEG e PNG terão versões WebP nos tamanhos gerados pelo WordPress. Os arquivos originais são preservados.</p>
    <p>Imagens pequenas sem versões redimensionadas, GIF, SVG, URLs externas e imagens de fundo em CSS não são convertidos. Imagens inseridas como tamanho original podem continuar em JPEG/PNG.</p>
    <?php if (!allgw_supported()) : ?>
        <div class="notice notice-error"><p>Seu servidor não oferece WebP no GD/Imagick. Solicite à hospedagem esse suporte. A conversão está desativada; uploads continuam funcionando.</p></div>
    <?php else : ?>
        <p>Suporte WebP disponível. Qualidade: 80. Nenhuma API ou serviço externo é usado.</p>
        <?php if (isset($_GET['converted'])) : ?>
            <div class="notice notice-info"><p><?php echo esc_html(sprintf('Último lote: %d imagens processadas, %d falhas. Falhas não são consideradas convertidas.', absint($_GET['converted']), isset($_GET['failed']) ? absint($_GET['failed']) : 0)); ?></p></div>
        <?php endif; ?>
        <?php if (isset($_GET['done'])) : ?><p><strong>Varredura concluída.</strong> Verifique eventuais falhas e limpe o cache do site/CDN antes de testar.</p><?php endif; ?>
        <h2>Converter biblioteca existente</h2>
        <p>Faça backup de uploads e banco de dados. Cada clique processa até 5 anexos JPEG/PNG e refaz suas miniaturas. Os tamanhos atualmente registrados pelo tema e plugins serão usados. Arquivos antigos ficam no disco para preservar URLs existentes. Durante a conversão, evite excluir anexos e mantenha o tema ativo.</p>
        <p>Otimizar uma biblioteca grande pode consumir tempo e espaço em disco. A regeneração substitui personalizações de miniaturas: use primeiro uma cópia de homologação se houver recortes manuais.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="allgw_batch">
        <input type="hidden" name="offset" value="<?php echo esc_attr($offset); ?>">
        <?php wp_nonce_field('allgw_batch'); submit_button($offset ? 'Continuar próximo lote' : 'Converter primeiro lote'); ?>
        </form>
        <?php if ($offset) : ?><p><?php echo esc_html(sprintf('%d anexos examinados nesta varredura.', $offset)); ?> <a href="<?php echo esc_url(admin_url('tools.php?page=allg-webp')); ?>">Recomeçar varredura</a></p><?php endif; ?>
    <?php endif; ?>
    <h2>Após converter</h2><p>Limpe o cache de páginas e CDN, verifique a página no celular e repita o PageSpeed. Em artigos antigos, o HTML salvo pode apontar para miniaturas JPEG/PNG antigas; reabra o artigo e selecione a imagem novamente para atualizar suas URLs. O plugin não altera o conteúdo dos artigos nem apaga arquivos.</p>
    </div>
    <?php
}
function allgw_convert($id) {
    if (!allgw_supported()) { return new WP_Error('allgw_unsupported', 'WebP indisponível no servidor.'); }
    $file = get_attached_file($id);
    if (!$file || !is_file($file) || !is_readable($file)) {
        return new WP_Error('allgw_missing', 'Arquivo original indisponível no disco local.');
    }
    // Regenerate from the original where available, rather than recompressing a WebP.
    $original = wp_get_original_image_path($id);
    if ($original && is_file($original)) { $file = $original; }
    $metadata = wp_generate_attachment_metadata($id, $file);
    if (!is_array($metadata) || empty($metadata['sizes'])) {
        return new WP_Error('allgw_no_sizes', 'Nenhuma miniatura gerada. Verifique tamanho e suporte da imagem.');
    }
    wp_update_attachment_metadata($id, $metadata);
    foreach ($metadata['sizes'] as $size) {
        if (isset($size['mime-type']) && 'image/webp' === $size['mime-type']) { return true; }
    }
    return new WP_Error('allgw_no_webp', 'O editor não gerou nenhuma versão WebP.');
}
function allgw_batch() {
    if (!current_user_can('manage_options') || !current_user_can('upload_files')) { wp_die('Acesso negado.', '', array('response' => 403)); }
    check_admin_referer('allgw_batch');
    if (!allgw_supported()) { wp_die('WebP indisponível no servidor.'); }
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $offset = isset($_POST['offset']) ? absint($_POST['offset']) : 0;
    $ids = get_posts(array('post_type'=>'attachment', 'post_status'=>'inherit', 'post_mime_type'=>array('image/jpeg','image/png'), 'posts_per_page'=>5, 'offset'=>$offset, 'orderby'=>'ID', 'order'=>'ASC', 'fields'=>'ids'));
    $converted = 0;
    $failed = 0;
    foreach ($ids as $id) {
        $result = allgw_convert($id);
        if (is_wp_error($result)) { $failed++; } else { $converted++; }
    }
    $args = array('page'=>'allg-webp', 'offset'=>$offset + count($ids), 'converted'=>$converted, 'failed'=>$failed);
    if (count($ids) < 5) { $args['done'] = 1; $args['offset'] = 0; }
    wp_safe_redirect(add_query_arg($args, admin_url('tools.php')));
    exit;
}
add_action('admin_post_allgw_batch', 'allgw_batch');
