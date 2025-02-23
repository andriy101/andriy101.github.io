// https://www.w3.org/TR/wai-aria/states_and_properties#aria-live
document.querySelector('button').addEventListener('click', () => {
  document.querySelector('.cdk-visually-hidden').textContent =
    document.querySelector('input[type=text]').value || 'Hello WORLD';
});
