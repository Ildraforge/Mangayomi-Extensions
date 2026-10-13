
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
    version: "0.1.0",
    dateFormat: "",
    dateFormatLocale: "",
    pkgPath: "manga/src/es/olympus.js",
    notes: "Catálogo, búsqueda local, capítulos y lector de Olympus Scans."
  }
];

class DefaultExtension extends MProvider {
  constructor() {
    super();
    this.baseUrl = "https://olympusxyz.com";
    this.apiUrl = `${this.baseUrl}/api`;
  }

  getHeaders() {
    return {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      "Accept": "application/json, text/html, */*",
      "Referer": `${this.baseUrl}/`
    };
  }

  async getJson(url) {
    const response = await new Client().get(url, this.getHeaders());
    return JSON.parse(response.body);
  }

  async getDocument(url) {
    const response = await new Client().get(url, this.getHeaders());
    return new Document(response.body);
  }

  absoluteUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
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
    const url = `${this.apiUrl}/series?page=${page}&direction=${direction}&type=comic`;
    const json = await this.getJson(url);
    const pagination = json.data && json.data.series;

    if (!pagination) {
      throw new Error("Olympus Scans: respuesta de catálogo inesperada");
    }

    return {
      list: (pagination.data || []).map(item => this.toManga(item)),
      hasNextPage: Number(pagination.current_page) < Number(pagination.last_page),
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

  async search(query, page, filters) {
    const term = String(query || "").trim().toLocaleLowerCase();

    if (!term) {
      return this.getPopular(page);
    }

    // Búsqueda provisional: el endpoint /api/series ignora search=.
    // Se consulta el catálogo completo y se filtra por título.
    const first = await this.getCatalog(1, "asc");
    const matches = first.list.filter(item =>
      item.name.toLocaleLowerCase().includes(term)
    );

    for (let p = 2; p <= first.totalPages; p++) {
      const result = await this.getCatalog(p, "asc");
      for (const item of result.list) {
        if (item.name.toLocaleLowerCase().includes(term)) {
          matches.push(item);
        }
      }
    }

    const pageSize = 15;
    const start = (page - 1) * pageSize;

    return {
      list: matches.slice(start, start + pageSize),
      hasNextPage: start + pageSize < matches.length
    };
  }

  async getDetail(url) {
    const slug = this.getSlug(url);
    const apiUrl = `${this.apiUrl}/series/${encodeURIComponent(slug)}?type=comic`;
    const response = await this.getJson(apiUrl);
    const item = response.data;

    if (!item || !item.name) {
      throw new Error("Olympus Scans: no se encontraron los detalles");
    }

    const episodes = [];
    let chapterPage = 1;
    let lastPage = 1;

    do {
      const chaptersUrl =
        `${this.apiUrl}/series/${encodeURIComponent(slug)}/chapters` +
        `?page=${chapterPage}&direction=desc&type=comic`;

      const chaptersResponse = await this.getJson(chaptersUrl);
      const chapters = chaptersResponse.data || [];

      for (const chapter of chapters) {
        episodes.push({
          name: `Capítulo ${chapter.name}`,
          url: `${this.baseUrl}/capitulo/${chapter.id}/comic-${slug}`,
          dateUpload: chapter.published_at || ""
        });
      }

      lastPage = Number(chaptersResponse.meta?.last_page) || 1;
      chapterPage++;
    } while (chapterPage <= lastPage);

    const genres = Array.isArray(item.genres)
      ? item.genres.map(genre =>
          typeof genre === "string" ? genre : genre.name
        ).filter(Boolean)
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
    const document = await this.getDocument(this.absoluteUrl(url));
    const images = [];
    const seen = new Set();

    for (const element of document.select("img")) {
      const src = element.attr("src") || "";

      // Las páginas tienen rutas /comics/{serieId}/{capituloId}/...
      // Las portadas usan /comics/covers/... y quedan excluidas.
      if (!/\/comics\/\d+\/\d+\//.test(src)) continue;

      const imageUrl = this.absoluteUrl(src);

      if (!seen.has(imageUrl)) {
        seen.add(imageUrl);
        images.push(imageUrl);
      }
    }

    return images;
  }

  getFilterList() {
    return [];
  }
}
