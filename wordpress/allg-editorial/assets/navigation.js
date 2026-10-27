document.documentElement.classList.add('js');
const button = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-navigation');
if (button && navigation) {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('is-open', !expanded);
  });
  navigation.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      button.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      button.focus();
    }
  });
}
