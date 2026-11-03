const setupNavigation = ({ refs, onAction, onTabSelect }) => {
  const bindAction = (selector, action) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener('click', () => onAction(action));
    });
  };

  bindAction('[data-action="prev"]', 'prev');
  bindAction('[data-action="next"]', 'next');
  bindAction('[data-action="focus-prev-tab"]', 'tabPrev');
  bindAction('[data-action="focus-next-tab"]', 'tabNext');
  bindAction('[data-action="confirm"]', 'confirm');
  bindAction('[data-action="back"]', 'back');

  refs.tabs.forEach((tab) => {
    tab.addEventListener('click', () => onTabSelect(tab.dataset.tab));
  });

  document.addEventListener('keydown', (event) => {
    const keyMap = {
      ArrowLeft: 'prev',
      ArrowRight: 'next',
      ArrowUp: 'tabPrev',
      ArrowDown: 'tabNext',
      Enter: 'confirm',
      Escape: 'back',
    };

    const action = keyMap[event.key];
    if (!action) return;

    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (typing && ['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    event.preventDefault();
    onAction(action);
  });
};

export { setupNavigation };
