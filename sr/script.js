// https://www.w3.org/TR/wai-aria/states_and_properties#aria-live
document.querySelector('button').addEventListener('click', () => {
  const liveRegion = document.querySelector('.cdk-visually-hidden');
  while (liveRegion.firstChild) {
    liveRegion.removeChild(liveRegion.firstChild);
  }

  setTimeout(() => {
    const message = document.createTextNode(document.querySelector('input[type=text]').value || 'Hello WORLD');
    liveRegion.appendChild(message);
  }, 100);
});
