
const mangayomiSources = [
  {
    name: "Olympus Scans",
    lang: "es",
    langs: ["es"],
    baseUrl: "https://olympusxyz.com",
    apiUrl: "https://olympusxyz.com/api",
    iconUrl: "https://olympusxyz.com/favicon.ico",
    typeSource: "single",
    itemType: 0,
    isManga: true,
    isNsfw: false,
    version: "0.1.3",
    dateFormat: "",
    dateFormatLocale: "",
    pkgPath: "manga/src/es/olympus.js",
    notes: "Catálogo, búsqueda por nombre, capítulos y lector de Olympus Scans."
  }
];

class DefaultExtension extends MProvider {
  constructor() {
    super();

    this.baseUrl = "https://olympusxyz.com";
    this.apiUrl = `${this.baseUrl}/api`;
    this.panelApiUrl = "https://panel.olympusxyz.com/api";
  }

  getHeaders() {
    return {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      "Accept": "application/json, text/html, */*",
      "Referer": `${this.baseUrl}/`
    };
  }

  async getJson(url) {
    const response = await new Client().get(
      url,
      this.getHeaders()
    );

    try {
      return JSON.parse(response.body);
    } catch (error) {
      throw new Error(
        `Olympus Scans: respuesta JSON inválida desde ${url}`
      );
    }
  }

  async getDocument(url) {
    const response = await new Client().get(
      url,
      this.getHeaders()
    );

    return new Document(response.body);
  }

  absoluteUrl(url) {
    if (!url) return "";

    if (url.startsWith("http")) {
      return url;
    }

    return `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  getSlug(url) {
    const path = url.split("?")[0].replace(/\/+$/, "");
    const last = path.split("/").pop() || "";

    return decodeURIComponent(last.replace(/^comic-/, ""));
  }

  seriesUrl(slug) {
    return `${this.baseUrl}/series/comic-${slug}`;
  }

  toManga(item) {
    return {
      name: item.name || "",
      imageUrl: item.cover || "",
      link: this.seriesUrl(item.slug)
    };
  }

  async getCatalog(page, direction = "asc") {
    const url =
      `${this.apiUrl}/series` +
      `?page=${page}&direction=${direction}&type=comic`;

    const json = await this.getJson(url);
    const pagination = json.data && json.data.series;

    if (!pagination) {
      throw new Error(
        "Olympus Scans: respuesta de catálogo inesperada"
      );
    }

    return {
      list: (pagination.data || []).map(item =>
        this.toManga(item)
      ),
      hasNextPage:
        Number(pagination.current_page) <
        Number(pagination.last_page),
      totalPages: Number(pagination.last_page) || 1
    };
  }

  async getPopular(page) {
    return this.getCatalog(page, "asc");
  }

  get supportsLatest() {
    return true;
  }

  async getLatestUpdates(page) {
    return this.getCatalog(page, "desc");
  }

  normalizeSearchText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  async search(query, page, filters) {
    const term = this.normalizeSearchText(query);

    if (!term) {
      return this.getPopular(page);
    }

    const response = await this.getJson(
      `${this.apiUrl}/series/list`
    );

    if (!response || !Array.isArray(response.data)) {
      throw new Error(
        "Olympus Scans: respuesta de búsqueda inesperada"
      );
    }

    const matches = response.data
      .filter(item =>
        item &&
        item.type === "comic" &&
        item.slug &&
        this.normalizeSearchText(item.name).includes(term)
      )
      .map(item => this.toManga(item));

    const pageSize = 15;
    const currentPage = Math.max(1, Number(page) || 1);
    const start = (currentPage - 1) * pageSize;

    return {
      list: matches.slice(start, start + pageSize),
      hasNextPage: start + pageSize < matches.length
    };
  }

  async getDetail(url) {
    const slug = this.getSlug(url);

    const detailUrl =
      `${this.apiUrl}/series/${encodeURIComponent(slug)}` +
      `?type=comic`;

    const response = await this.getJson(detailUrl);
    const item = response.data;

    if (!item || !item.name) {
      throw new Error(
        "Olympus Scans: no se encontraron los detalles"
      );
    }

    const episodes = [];
    let chapterPage = 1;
    let lastPage = 1;

    do {
      const chaptersUrl =
        `${this.panelApiUrl}/series/` +
        `${encodeURIComponent(slug)}/chapters` +
        `?page=${chapterPage}&direction=desc&type=comic`;

      const chaptersResponse = await this.getJson(chaptersUrl);
      const chapters = chaptersResponse.data || [];

      for (const chapter of chapters) {
        let dateUpload = "";

        if (chapter.published_at) {
          const timestamp = Date.parse(
            chapter.published_at
          );

          if (!Number.isNaN(timestamp)) {
            dateUpload = String(timestamp);
          }
        }

        episodes.push({
          name: `Capítulo ${chapter.name}`,
          url: `${this.baseUrl}/capitulo/${chapter.id}/comic-${slug}`,
          dateUpload
        });
      }

      lastPage =
        Number(chaptersResponse.meta?.last_page) || 1;

      chapterPage++;
    } while (chapterPage <= lastPage);

    const genres = Array.isArray(item.genres)
      ? item.genres
          .map(genre =>
            typeof genre === "string"
              ? genre
              : genre.name
          )
          .filter(Boolean)
      : [];

    return {
      name: item.name,
      title: item.name,
      link: this.seriesUrl(item.slug || slug),
      imageUrl: item.cover || "",
      description: item.summary || "",
      author: "",
      genre: genres,
      status: -1,
      episodes,
      chapters: episodes
    };
  }

  async getPageList(url) {
    const document = await this.getDocument(
      this.absoluteUrl(url)
    );

    const images = [];
    const seen = new Set();

    for (const element of document.select("img")) {
      const src = element.attr("src") || "";

      if (!/\/comics\/\d+\/\d+\//.test(src)) {
        continue;
      }

      const imageUrl = this.absoluteUrl(src);

      if (seen.has(imageUrl)) {
        continue;
      }

      seen.add(imageUrl);

      images.push({
        url: imageUrl,
        headers: {
          "Referer": `${this.baseUrl}/`,
          "Accept": "image/avif,image/webp,image/*,*/*"
        }
      });
    }

    return images;
  }

  getFilterList() {
    return [];
  }
}
