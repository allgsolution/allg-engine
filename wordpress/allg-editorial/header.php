<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main"><?php esc_html_e('Pular para o conteúdo','allg-editorial'); ?></a>
<?php $kicker=get_theme_mod('allge_kicker','LEITURA QUE INFORMA. IDEIAS QUE INSPIRAM.'); if($kicker): ?><div class="topline"><div class="wrap"><?php echo esc_html($kicker); ?></div></div><?php endif; ?>
<header class="site-header"><div class="wrap header-main"><div><?php if(has_custom_logo()){ the_custom_logo(); } else { ?><a class="brand" href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a><?php } ?><p class="tagline"><?php bloginfo('description'); ?></p></div><?php get_search_form(); ?></div>
<div class="nav-bar"><div class="wrap"><button class="menu-toggle" aria-controls="primary-navigation" aria-expanded="false"><?php esc_html_e('Menu','allg-editorial'); ?></button><nav id="primary-navigation" class="primary-nav" aria-label="<?php esc_attr_e('Menu principal','allg-editorial'); ?>"><?php wp_nav_menu(array('theme_location'=>'primary','container'=>false,'fallback_cb'=>'allge_fallback_menu')); ?></nav></div></div></header>
<?php if(is_active_sidebar('ad-top')): ?><div class="wrap ad"><?php dynamic_sidebar('ad-top'); ?></div><?php endif; ?>
