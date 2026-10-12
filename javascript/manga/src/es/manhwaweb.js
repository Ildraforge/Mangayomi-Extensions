
const mangayomiSources = [
  {
    name: "ManhwaWeb",
    lang: "es",
    baseUrl: "https://manhwaweb.com",
    apiUrl: "https://api.manhwaweb.com",
    iconUrl: "https://manhwaweb.com/favicon.ico",
    typeSource: "single",
    itemType: 0,
    version: "0.1.4",
    pkgPath: "manga/src/es/manhwaweb.js",
    notes: "Fuente en español. Incluye contenido para adultos.",
    isNsfw: true
  }
];

const MANHWAWEB_GENRES = [
  ["Acción", "3"],
["Aventura", "29"],
["Comedia", "18"],
["Drama", "1"],
["Recuentos de la vida", "42"],
["Romance", "2"],
["Venganza", "5"],
["Harem", "6"],
["Fantasía", "23"],
["Sobrenatural", "31"],
["Tragedia", "25"],
["Psicológico", "43"],
["Horror", "32"],
["Thriller", "44"],
["Historias cortas", "28"],
["Ecchi", "30"],
["Gore", "34"],
["Girls love", "27"],
["Boys love", "45"],
["Reencarnación", "41"],
["Sistema de niveles", "37"],
["Ciencia ficción", "33"],
["Apocalíptico", "38"],
["Artes marciales", "39"],
["Superpoderes", "40"],
["Cultivación (cultivo)", "35"],
["Milf", "8"]
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

  buildLibraryUrl(page, params = {}) {
    const pageIndex = Math.max(0, Number(page || 1) - 1);

    const query = Object.assign(
      { page: String(pageIndex) },
                                params
    );

    const pairs = Object.keys(query)
    .filter(key => query[key] !== undefined && query[key] !== null)
    .map(key =>
    encodeURIComponent(key) +
    "=" +
    encodeURIComponent(String(query[key]))
    );

    return `${this.getApiUrl()}/manhwa/library?${pairs.join("&")}`;
  }

  async getPopular(page) {
    const json = await this.fetchJson(
      this.buildLibraryUrl(page)
    );

    return this.parseMangaList(json);
  }

  get supportsLatest() {
    return true;
  }

  async getLatestUpdates(page) {
    const json = await this.fetchJson(
      this.buildLibraryUrl(page, {
        order_item: "creacion",
        order_dir: "desc"
      })
    );

    return this.parseMangaList(json);
  }

  getSelectedValue(filter) {
    if (!filter || !Array.isArray(filter.values)) {
      return "";
    }

    const index = Number(filter.state || 0);
    const selected = filter.values[index];

    return selected
    ? String(selected.value ?? "")
    : "";
  }

  getSelectedGenres(filter) {
    if (!filter || !Array.isArray(filter.state)) {
      return [];
    }

    return filter.state
    .filter(item => item && item.state === true)
    .map(item => String(item.value))
    .filter(Boolean);
  }

  async search(query, page, filters) {
    const params = {
      buscar: query || "",
      estado: "",
      tipo: "",
      erotico: "",
      demografia: "",
      order_item: "alfabetico",
      order_dir: "desc",
      generes: ""
    };

    const selectedGenres = [];

    const filterList = Array.isArray(filters)
    ? filters
    : Array.isArray(filters?.filters)
    ? filters.filters
    : [];

    for (const filter of filterList) {
      if (!filter) {
        continue;
      }

      if (filter.type_name === "SelectFilter") {
        const value = this.getSelectedValue(filter);

        switch (filter.name) {
          case "Tipo":
            params.tipo = value;
            break;

          case "Demografía":
            params.demografia = value;
            break;

          case "Estado":
            params.estado = value;
            break;

          case "Erótico":
            params.erotico = value;
            break;

          case "Ordenar por":
            params.order_item = value || "alfabetico";
            break;

          case "Dirección":
            params.order_dir = value || "desc";
            break;
        }
      }

      if (
        filter.type_name === "GroupFilter" &&
        filter.name === "Géneros"
      ) {
        selectedGenres.push(
          ...this.getSelectedGenres(filter)
        );
      }
    }

    if (selectedGenres.length > 4) {
      throw new Error(
        "ManhwaWeb permite seleccionar un máximo de 4 géneros."
      );
    }

    params.generes = selectedGenres.join("a");

    const json = await this.fetchJson(
      this.buildLibraryUrl(page, params)
    );

    return this.parseMangaList(json);
  }

  getStatus(status) {
    const normalized = String(status || "")
    .trim()
    .toLowerCase();

    const statusMap = {
      finalizado: 1,
      completado: 1,
      completo: 1,
      publicandose: 0,
        "publicándose": 0,
        encurso: 0,
        pendiente: 2,
        pausado: 2,
        cancelado: 3
    };

    return statusMap[normalized] ?? 5;
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
      status: this.getStatus(data._status),
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
    const select = (name, entries, defaultIndex = 0) => ({
      type_name: "SelectFilter",
      name,
      state: defaultIndex,
      values: entries.map(entry => ({
        type_name: "SelectOption",
        name: entry[0],
        value: entry[1]
      }))
    });

    return [
      select("Tipo", [
        ["Ver todo", ""],
        ["Manhwa", "manhwa"],
        ["Manga", "manga"],
        ["Manhua", "manhua"],
        ["Doujinshi", "doujinshi"],
        ["Novela", "novela"],
        ["One shot", "one_shot"]
      ]),

      select("Demografía", [
        ["Ver todo", ""],
        ["Seinen", "seinen"],
        ["Shonen", "shonen"],
        ["Josei", "josei"],
        ["Shojo", "shojo"]
      ]),

      select("Estado", [
        ["Ver todo", ""],
        ["Publicándose", "publicandose"],
        ["Pausado", "pausado"],
        ["Finalizado", "finalizado"]
      ]),

      select("Erótico", [
        ["Ver todo", ""],
        ["Sí", "si"],
        ["No", "no"]
      ]),

      {
        type_name: "GroupFilter",
        name: "Géneros",
        state: MANHWAWEB_GENRES.map(entry => ({
          type_name: "CheckBox",
          name: entry[0],
          value: entry[1],
          state: false
        }))
      },

      select("Ordenar por", [
        ["Alfabético", "alfabetico"],
        ["Creación", "creacion"],
        ["Popularidad", "popularidad"],
        ["Número de capítulos", "num_chapter"]
      ]),

      select("Dirección", [
        ["Descendente", "desc"],
        ["Ascendente", "asc"]
      ])
    ];
  }
}
