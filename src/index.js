import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.loader__button');
const topBtn = document.querySelector('#topBtn');
const safeSearch = true;
const PIXAKEY = '32222044-655cc419c9aea65946173f7db';

let scroller = 0;
let totalHits = 0;
let page = 1;
let amount = 40;
let totalPages = 1;

form.addEventListener('submit', async event => {
  event.preventDefault();
  await searchHandler();
});
window.addEventListener('scroll', function () {
  if (
    window.innerHeight + window.scrollY >= document.body.scrollHeight &&
    page < totalPages &&
    gallery.firstElementChild
  ) {
    loadBtn.style.display = 'block';
  } else if (
    window.innerHeight + window.scrollY >= document.body.scrollHeight &&
    page === totalPages
  ) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
});
loadBtn.addEventListener('click', () => {
  if (page < totalPages) createImageLoader(), (loadBtn.style.display = 'none');
});

// go on top
const scrollFunction = () => {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    topBtn.style.display = 'block';
  } else {
    topBtn.style.display = 'none';
  }
};
const goTop = () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};

// creation of pagination
const createImageLoader = () => {
  if (!gallery.firstElementChild) return;
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  scroller = cardHeight;

  if (page < totalPages) return (page += 1), fetchPictures(input.value);
  else
    throw Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
};

const getUrl = search =>
  `https://pixabay.com/api/?key=${PIXAKEY}&q=${search}&type=photo&orientation=horizontal&safesearch=${safeSearch}&per_page=${amount}&page=${page}`;

// fetcher
const fetchPictures = async name => {
  const parsedName = name.trim();
  if (parsedName.length === 0) return;
  const url = getUrl(parsedName);
  try {
    const { data } = await axios(url);
    if (data.hits.length === 0) {
      throw Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    totalHits = data.totalHits;
    return renderImages(data.hits);
  } catch (error) {
    console.error(error);
  }
};

// simplelightbox
const lightbox = new SimpleLightbox(`.gallery a`, {
  disableRightClick: true,
  captionsData: 'alt',
  captionDelay: 500,
  scrollZoom: true,
});

// gallery
const renderImages = async result => {
  const img = await result
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<article class="photo-card">
        <div>
          <a href="${largeImageURL}">
            <img
              class="gallery__image"
              src="${webformatURL}"
              alt="${tags}"
              loading="lazy"
            />
          </a>
        </div>
        <section class="info">
          <div>
            <p class="info-item"><b>Likes</b></p>
            <p>${likes}</p>
          </div>
          <div>
            <p class="info-item"><b>Views</b></p>
            <p>${views}</p>
          </div>
          <div>
            <p class="info-item"><b>Comments</b></p>
            <p>${comments}</p>
          </div>
          <div>
            <p class="info-item"><b>Downloads</b></p>
            <p>${downloads}</p>
          </div>
        </section>
      </article>
      `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', img);
  await lightbox.refresh();
  scrollPage();
};
const scrollPage = () => {
  window.scrollBy({
    top: scroller * 3,
    behavior: 'smooth',
  });
};

// search heandling
const searchHandler = async () => {
  gallery.innerHTML = '';
  page = 1;
  totalHits = 0;
  scroller = 46;
  await fetchPictures(input.value);
  totalPages = Math.ceil(totalHits / amount);

  if (totalHits === 0) return;
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
};

topBtn.addEventListener('click', goTop);

window.onscroll = function () {
  scrollFunction();
};
