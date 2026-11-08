'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobileViewport = window.matchMedia('(max-width: 720px)');

function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.firstElementChild.textContent = open ? 'Закрыть' : 'Меню';
  navigation.classList.toggle('is-open', open);
  navigation.inert = mobileViewport.matches && !open;

  if (restoreFocus) menuButton.focus();
}

function menuIsOpen() {
  return menuButton.getAttribute('aria-expanded') === 'true';
}

document.querySelector('.header').classList.add('menu-ready');
menuButton.hidden = false;
setMenu(false);

menuButton.addEventListener('click', () => setMenu(!menuIsOpen()));
mobileViewport.addEventListener('change', () => setMenu(false));
navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!menuIsOpen() || !link) return;

  const section = document.querySelector(link.hash);
  setMenu(false);
  section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuIsOpen()) setMenu(false, true);
});
document.addEventListener('focusin', (event) => {
  if (menuIsOpen() && event.target !== menuButton && !navigation.contains(event.target)) {
    setMenu(false);
  }
});
document.addEventListener('click', (event) => {
  if (!menuIsOpen() || event.target.closest('.header')) return;
  setMenu(false, navigation.contains(document.activeElement));
});

for (const image of document.querySelectorAll('[data-fallback]')) {
  const media = image.closest('.media');
  const showFallback = () => media.classList.add('is-missing');
  image.addEventListener('error', showFallback);
  image.addEventListener('load', () => media.classList.remove('is-missing'));
  if (image.getAttribute('src') && image.complete && !image.naturalWidth) showFallback();
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  document.documentElement.classList.add('reveal-ready');
  document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
}

const lightbox = document.querySelector('.lightbox');
const enlargedImage = lightbox.querySelector('img');
const photoCaption = document.querySelector('#photo-caption');
const galleryLinks = [...document.querySelectorAll('.gallery-link')];
let photoIndex = 0;
let galleryTrigger;

function showPhoto(index) {
  photoIndex = (index + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[photoIndex];
  const caption = link.nextElementSibling;
  enlargedImage.closest('.media').classList.remove('is-missing');
  enlargedImage.alt = link.querySelector('img').alt;
  enlargedImage.src = link.href;
  photoCaption.textContent = `${photoIndex + 1} / ${galleryLinks.length} · ${caption.lastChild.textContent.trim()}`;
}

if (typeof lightbox.showModal === 'function') {
  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      galleryTrigger = link;
      showPhoto(index);
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.previous').addEventListener('click', () => showPhoto(photoIndex - 1));
  lightbox.querySelector('.next').addEventListener('click', () => showPhoto(photoIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => galleryTrigger?.focus());
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
  });
}

const form = document.querySelector('.contact-form');
const serviceField = document.querySelector('#service');
const nameField = document.querySelector('#contact-name');
const phoneField = document.querySelector('#contact-phone');
const status = form.querySelector('.form-status');

function validateField(field) {
  const value = field.value.trim();
  const error = document.getElementById(field.getAttribute('aria-describedby'));
  let message = '';

  if (field === nameField && !value) {
    message = 'Введите имя.';
  } else if (field === phoneField) {
    const digits = value.replace(/\D/g, '');
    if (!value) {
      message = 'Введите номер телефона.';
    } else if (digits.length < 7 || digits.length > 15 || field.validity.patternMismatch) {
      message = 'Введите телефон с 7–15 цифрами. Например, +7 (000) 000-00-00.';
    }
  }

  if (message) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
  error.textContent = message;
  return !message;
}

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    serviceField.value = link.dataset.service;
    status.textContent = '';
  });
});

form.addEventListener('input', (event) => {
  status.textContent = '';
  if (event.target.getAttribute('aria-invalid') === 'true') validateField(event.target);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  status.textContent = '';
  const invalidFields = [nameField, phoneField].filter((field) => !validateField(field));
  if (invalidFields.length) {
    invalidFields[0].focus();
    return;
  }
  status.textContent = 'Поля заполнены. Это демонстрационная форма. Заявка не отправлена.';
});

form.noValidate = true;
form.querySelector('button[type="submit"]').disabled = false;

