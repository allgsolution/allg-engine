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
}
add_action('after_setup_theme','allge_setup');
function allge_assets() {
    wp_enqueue_style('allge-style',get_stylesheet_uri(),array(),wp_get_theme()->get('Version'));
    $accent = sanitize_hex_color(get_theme_mod('allge_accent','#166534'));
    if ($accent) { wp_add_inline_style('allge-style', ':root{--accent:'.$accent.';}'); }
    wp_enqueue_script('allge-navigation',get_template_directory_uri().'/assets/navigation.js',array(),'1.0.0',true);
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
    $c->add_setting('allge_accent',array('default'=>'#166534','sanitize_callback'=>'sanitize_hex_color'));
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
