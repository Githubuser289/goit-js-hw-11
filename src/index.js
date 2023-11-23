import ApiService from './pixabay-api.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form'),
  inputElem = document.querySelector('form>input'),
  galleryContainer = document.querySelector('.gallery');
const PER_PAGE = 40;
let per_page = PER_PAGE,
  totalPages = 1,
  endreached = false,
  lightbox;
const apiService = new ApiService();

function onSearch(element) {
  element.preventDefault();
  galleryContainer.innerHTML = '';
  endreached = false;
  scrollTopBtn.style.display = 'none';
  apiService.query = inputElem.value.trim();
  apiService.resetPage();
  if (apiService.query === '') {
    Notify.warning('Please, fill the main field');
    return;
  }
  fetchGallery();
}

async function fetchGallery() {
  if (apiService.page > totalPages) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    endreached = true;
    scrollTopBtn.style.display = 'block';
    return;
  }
  const result = await apiService.fetchImages();
  if (!result) {
    inputElem.value = '';
    return;
  }
  const { hits, total } = result;
  if (apiService.page === 2) {
    if (total === 0) {
      Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }
    totalPages = Math.floor(total / per_page) + 1;
    Notify.success(`Hooray! We found ${total} images !!!`);
  }
  displayImages(hits);
  if (apiService.page === 2) {
    lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
}

function displayImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
          <a href="${largeImageURL}">
            <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info"> 
            <p class="info-item"> <b>Likes</b>    ${likes} </p>
            <p class="info-item"> <b>Views</b>    ${views} </p>
            <p class="info-item"> <b>Comments</b> ${comments} </p>
            <p class="info-item"> <b>Downloads</b> ${downloads} </p>
          </div>
        </div>`;
      }
    )
    .join('');
  galleryContainer.insertAdjacentHTML('beforeend', markup);

  if (apiService.page > totalPages) {
    scrollTopBtn.style.display = 'block';
  }
}

searchForm.addEventListener('submit', onSearch);

// infinite scrolling
let throttlePause;
const throttle = (callback, time) => {
  if (throttlePause) return;
  throttlePause = true;
  setTimeout(() => {
    callback();
    throttlePause = false;
  }, time);
};
const handleInfiniteScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5 && !endreached) {
    fetchGallery();
  }
};

window.addEventListener('scroll', () => {
  throttle(handleInfiniteScroll, 250);
});

// Home button for end of scrolling (final page)
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerText = 'Home';
scrollTopBtn.id = 'scroll-top';
document.body.appendChild(scrollTopBtn);
scrollTopBtn.addEventListener('click', () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});
