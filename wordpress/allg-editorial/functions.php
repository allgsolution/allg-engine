<?php
if (!defined('ABSPATH')) { exit; }
function allge_setup() {
    load_theme_textdomain('allg-editorial', get_template_directory() . '/languages');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('responsive-embeds');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
    add_theme_support('html5', array('search-form','comment-form','comment-list','gallery','caption','style','script'));
    add_theme_support('custom-logo', array('height'=>80,'width'=>240,'flex-height'=>true,'flex-width'=>true));
    register_nav_menus(array('primary'=>__('Menu principal','allg-editorial'),'footer'=>__('Menu do rodapé','allg-editorial')));
    add_image_size('allge-card', 800, 500, true);
    add_image_size('allge-card-small', 400, 250, true);
    add_image_size('allge-card-mobile', 600, 375, true);
}
add_action('after_setup_theme','allge_setup');
function allge_assets() {
    wp_enqueue_style('allge-style',get_stylesheet_uri(),array(),wp_get_theme()->get('Version'));
    $accent = sanitize_hex_color(get_theme_mod('allge_accent','#8a2143'));
    if ($accent) { wp_add_inline_style('allge-style', ':root{--accent:'.$accent.';}'); }
    wp_enqueue_script('allge-navigation',get_template_directory_uri().'/assets/navigation.js',array(),wp_get_theme()->get('Version'),true);
    if (is_singular('post')) {
        wp_enqueue_script('allge-share',get_template_directory_uri().'/assets/share.js',array(),wp_get_theme()->get('Version'),true);
    }
    if (is_singular() && comments_open() && get_option('thread_comments')) { wp_enqueue_script('comment-reply'); }
}
add_action('wp_enqueue_scripts','allge_assets');
function allge_widgets() {
    $areas = array('sidebar'=>'Barra lateral','ad-top'=>'Anúncio acima do conteúdo','ad-article'=>'Anúncio após o artigo','footer'=>'Rodapé');
    foreach ($areas as $id=>$name) { register_sidebar(array('name'=>$name,'id'=>$id,'before_widget'=>'<section id="%1$s" class="widget %2$s">','after_widget'=>'</section>','before_title'=>'<h2 class="widget-title">','after_title'=>'</h2>')); }
}
add_action('widgets_init','allge_widgets');
function allge_customize($c) {
    $c->add_section('allge_options',array('title'=>__('ALLG Editorial','allg-editorial'),'priority'=>30));
    $settings=array('allge_kicker'=>array('LEITURA QUE INFORMA. IDEIAS QUE INSPIRAM.','Faixa superior'),'allge_heading'=>array('Boas histórias começam aqui.','Título da página do blog'),'allge_description'=>array('Conteúdo selecionado para descobrir, aprender e ir além.','Descrição do blog'),'allge_copyright'=>array('','Texto do rodapé (opcional)'));
    foreach($settings as $key=>$data){ $c->add_setting($key,array('default'=>$data[0],'sanitize_callback'=>'sanitize_text_field')); $c->add_control($key,array('label'=>$data[1],'section'=>'allge_options','type'=>'text')); }
    $c->add_setting('allge_accent',array('default'=>'#8a2143','sanitize_callback'=>'sanitize_hex_color'));
    $c->add_control(new WP_Customize_Color_Control($c,'allge_accent',array('label'=>'Cor de destaque','section'=>'allge_options')));
}
add_action('customize_register','allge_customize');
function allge_categories() {
    $cats=get_the_category();
    if ($cats) { echo '<a class="category-label" href="'.esc_url(get_category_link($cats[0]->term_id)).'">'.esc_html($cats[0]->name).'</a>'; }
}

function allge_fallback_menu() {
    echo '<ul class="menu"><li><a href="'.esc_url(home_url('/')).'">'.esc_html__('Início','allg-editorial').'</a></li>';
    wp_list_pages(array('title_li'=>'','depth'=>2));
    echo '</ul>';
}

/** Server-rendered share links work without JavaScript or third-party SDKs. */
function allge_share_buttons() {
    $url = get_permalink();
    if (!$url || post_password_required()) { return; }
    $title = wp_strip_all_tags(get_the_title());
    $encoded_url = rawurlencode($url);
    $encoded_title = rawurlencode($title);
    $links = array(
        'WhatsApp' => 'https://api.whatsapp.com/send?text=' . rawurlencode($title . ' ' . $url),
        'Facebook' => 'https://www.facebook.com/sharer/sharer.php?u=' . $encoded_url,
        'Telegram' => 'https://t.me/share/url?url=' . $encoded_url . '&text=' . $encoded_title,
        'X' => 'https://twitter.com/intent/tweet?url=' . $encoded_url . '&text=' . $encoded_title,
    );
    $image = get_the_post_thumbnail_url(get_the_ID(), 'full');
    if ($image) {
        $links['Pinterest'] = 'https://www.pinterest.com/pin/create/button/?url=' . $encoded_url . '&media=' . rawurlencode($image) . '&description=' . $encoded_title;
    }
    ?>
    <section class="share-panel" aria-label="<?php esc_attr_e('Compartilhar artigo','allg-editorial'); ?>" data-share-url="<?php echo esc_url($url); ?>" data-share-title="<?php echo esc_attr($title); ?>">
        <h2><?php esc_html_e('Coisas boas merecem ser compartilhadas','allg-editorial'); ?></h2>
        <p><?php esc_html_e('Envie esta leitura para alguém especial.','allg-editorial'); ?></p>
        <div class="share-actions">
        <?php foreach ($links as $network => $link) : ?>
            <a href="<?php echo esc_url($link); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr(sprintf(__('Compartilhar no %s (abre em nova aba)','allg-editorial'), $network)); ?>"><?php echo esc_html($network); ?></a>
        <?php endforeach; ?>
        <a href="<?php echo esc_url('mailto:?subject=' . $encoded_title . '&body=' . rawurlencode($title . "\r\n" . $url)); ?>"><?php esc_html_e('E-mail','allg-editorial'); ?></a>
        <button type="button" data-share-copy hidden><?php esc_html_e('Copiar link','allg-editorial'); ?></button>
        <button type="button" data-share-native hidden><?php esc_html_e('Mais opções','allg-editorial'); ?></button>
        </div>
        <div class="share-fallback" hidden><label><?php esc_html_e('Selecione e copie este link:','allg-editorial'); ?><input type="text" readonly value="<?php echo esc_url($url); ?>"></label></div>
        <div class="share-status" role="status" aria-live="polite"></div>
    </section>
    <?php
}
