import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export default class ApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.PER_PAGE = 40;
  }
  async fetchImages() {
    const options = {
      method: 'get',
      url: 'https://pixabay.com/api/',
      params: {
        key: '40810721-4617741b248e6711ba03b05ba',
        q: `${this.searchQuery}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: `${this.page}`,
        per_page: `${this.PER_PAGE}`,
      },
    };
    try {
      const response = await axios(options);
      this.incrementPage();
      return response.data;
    } catch (error) {
      Notify.failure(`Oops! Something went wrong! Error:` + error);
    }
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
