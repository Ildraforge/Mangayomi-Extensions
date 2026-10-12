
const mangayomiSources = [
  {
    name: "ManhwaWeb",
    lang: "es",
    baseUrl: "https://manhwaweb.com",
    apiUrl: "https://api.manhwaweb.com",
    iconUrl: "https://manhwaweb.com/favicon.ico",
    typeSource: "single",
    itemType: 0,
    version: "0.1.1",
    pkgPath: "manga/src/es/manhwaweb.js",
    notes: "Fuente en español. Incluye contenido para adultos.",
    isNsfw: true
  }
];

class DefaultExtension extends MProvider {
  getApiUrl() {
    return this.source.apiUrl || "https://api.manhwaweb.com";
  }

  getHeaders() {
    return {
      Referer: "https://manhwaweb.com/",
      Origin: "https://manhwaweb.com",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0"
    };
  }

  async fetchJson(url) {
    const response = await new Client().get(
      url,
      this.getHeaders()
    );

    if (!response || !response.body) {
      throw new Error("ManhwaWeb devolvió una respuesta vacía.");
    }

    return JSON.parse(response.body);
  }

  getMangaId(url) {
    return String(url || "")
    .split("/manhwa/")
    .pop()
    .split("?")[0]
    .replace(/\/$/, "");
  }

  getChapterId(url) {
    return String(url || "")
    .split("/leer/")
    .pop()
    .split("?")[0]
    .replace(/\/$/, "");
  }

  parseMangaList(json) {
    const entries = Array.isArray(json.data)
    ? json.data
    : [];

    const list = entries
    .filter(item => item && item._id)
    .map(item => ({
      name: item.name_esp || item.the_real_name || "Sin título",
      imageUrl: item._imagen || "",
      link: `/manhwa/${item._id}`
    }));

    return {
      list,
      hasNextPage: json.next === true
    };
  }

  async getPopular(page) {
    const pageIndex = Math.max(0, Number(page || 1) - 1);

    const url =
    `${this.getApiUrl()}/manhwa/library` +
    `?page=${pageIndex}`;

    const json = await this.fetchJson(url);

    return this.parseMangaList(json);
  }

  get supportsLatest() {
    return true;
  }

  async getLatestUpdates(page) {
    const pageIndex = Math.max(0, Number(page || 1) - 1);

    const url =
    `${this.getApiUrl()}/manhwa/library` +
    `?order_item=actualizado` +
    `&order_dir=desc` +
    `&page=${pageIndex}`;

    const json = await this.fetchJson(url);

    return this.parseMangaList(json);
  }

  async search(query, page, filters) {
    const pageIndex = Math.max(0, Number(page || 1) - 1);

    const url =
    `${this.getApiUrl()}/manhwa/library` +
    `?buscar=${encodeURIComponent(query || "")}` +
    `&page=${pageIndex}`;

    const json = await this.fetchJson(url);

    return this.parseMangaList(json);
  }

  async getDetail(url) {
    const id = this.getMangaId(url);

    if (!id) {
      throw new Error("No se pudo identificar el manhwa.");
    }

    const data = await this.fetchJson(
      `${this.getApiUrl()}/manhwa/see/${encodeURIComponent(id)}`
    );

    const chapters = (data.chapters || [])
    .filter(chapter => chapter && chapter.link)
    .map(chapter => ({
      name: `Capítulo ${chapter.chapter}`,
      url: chapter.link,
      dateUpload: String(chapter.create || 0)
    }))
    .reverse();

    const authors = (data.autor || [])
    .map(author => author.name)
    .filter(Boolean);

    const statusMap = {
      finalizado: "Completed",
      publicandose: "Ongoing",
        pendiente: "On Hiatus"
    };

    const genre = [
      data._tipo,
      data._demografi
    ].filter(Boolean);

    if (data._erotico === "si") {
      genre.push("Adulto");
    }

    return {
      title:
      data.name_esp ||
      data.the_real_name ||
      "Sin título",

      description: data._sinopsis || "",

      imageUrl: data._imagen || "",

      status:
      statusMap[data._status] ||
      "Unknown",

      author: authors.join(", "),

      genre,

      chapters
    };
  }

  async getPageList(url) {
    const chapterId = this.getChapterId(url);

    if (!chapterId) {
      throw new Error("No se pudo identificar el capítulo.");
    }

    const data = await this.fetchJson(
      `${this.getApiUrl()}/chapters/see/` +
      encodeURIComponent(chapterId)
    );

    const images = data.chapter?.img || [];

    return images.filter(
      image =>
      typeof image === "string" &&
      image.startsWith("http")
    );
  }

  getFilterList() {
    return [];
  }
}
