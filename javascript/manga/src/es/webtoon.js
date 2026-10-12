
const WEBTOON_GENRES = [
  ["Acción", "action"],
  ["Comedia", "comedy"],
  ["Drama", "drama"],
  ["Fantasía", "fantasy"],
  ["Reconfortante", "heartwarming"],
  ["Histórico", "historical"],
  ["Terror", "horror"],
  ["Misterio", "mystery"],
  ["Romance", "romance"],
  ["Ciencia ficción", "sf"],
  ["Vida cotidiana", "slice_of_life"],
  ["Deportes", "sports"],
  ["Superhéroes", "super_hero"],
  ["Sobrenatural", "supernatural"],
  ["Suspenso", "thriller"],
  ["Consejos", "tiptoon"]
];

const WEBTOON_SORT_OPTIONS = [
  ["Popularidad", "MANA"],
  ["Actualizaciones recientes", "UPDATE"],
  ["Me gusta", "LIKEIT"]
];

const mangayomiSources = [
  {
    name: "WEBTOON Español",
    lang: "es",
    langs: ["es"],
    baseUrl: "https://www.webtoons.com",
    apiUrl: "",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Naver_Line_Webtoon_logo.png",
    typeSource: "single",
    itemType: 0,
    isManga: true,
    isNsfw: false,
    version: "0.2.0",
    dateFormat: "",
    dateFormatLocale: "",
    pkgPath: "manga/src/es/webtoon.js",
    notes: "WEBTOON Español. Filtros de género y ordenamiento."
  }
];

class DefaultExtension extends MProvider {
  constructor() {
    super();
    this.baseUrl = "https://www.webtoons.com";
  }

  getHeaders() {
    return {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
      Referer: "https://www.webtoons.com/",
      Accept: "text/html,application/xhtml+xml,*/*"
    };
  }

  absoluteUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    if (url.startsWith("/")) return this.baseUrl + url;
    return this.baseUrl + "/" + url;
  }

  cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  getAttribute(element, attribute) {
    if (!element) return "";
    return element.attr(attribute) || "";
  }

  getImage(element) {
    if (!element) return "";

    return this.absoluteUrl(
      element.attr("data-src") ||
      element.attr("src") ||
      ""
    );
  }

  getLink(element) {
    if (!element) return "";

    return this.absoluteUrl(
      element.attr("href") ||
      element.getHref ||
      ""
    );
  }

  async fetchDocument(url) {
    const response = await new Client().get(
      url,
      this.getHeaders()
    );

    return new Document(response.body);
  }

  parseCards(doc, selector) {
    const list = [];
    const seen = new Set();

    for (const element of doc.select(selector)) {
      const link = this.getLink(element);

      if (!link || !link.includes("title_no=")) {
        continue;
      }

      if (seen.has(link)) continue;

      const image = element.selectFirst("img");

      const titleElement =
        element.selectFirst(".title") ||
        element.selectFirst("strong.title") ||
        element.selectFirst("h3") ||
        element.selectFirst("h4");

      const imageUrl = this.getImage(image);

      let name = titleElement
        ? this.cleanText(titleElement.text)
        : "";

      if (!name && image) {
        name = this.getAttribute(image, "alt");
      }

      if (!name) continue;

      seen.add(link);

      list.push({
        name,
        imageUrl,
        link
      });
    }

    return list;
  }

  buildGenreUrl(genre, sort) {
    return (
      this.baseUrl +
      "/es/genres/" +
      encodeURIComponent(genre) +
      "?sortOrder=" +
      encodeURIComponent(sort)
    );
  }

  async getPopular(page) {
    if (page > 1) {
      return {
        list: [],
        hasNextPage: false
      };
    }

    const doc = await this.fetchDocument(
      this.buildGenreUrl("fantasy", "MANA")
    );

    return {
      list: this.parseCards(
        doc,
        "a.link._genre_title_a"
      ),
      hasNextPage: false
    };
  }

  get supportsLatest() {
    return true;
  }

  async getLatestUpdates(page) {
    if (page > 1) {
      return {
        list: [],
        hasNextPage: false
      };
    }

    const doc = await this.fetchDocument(
      this.buildGenreUrl("fantasy", "UPDATE")
    );

    return {
      list: this.parseCards(
        doc,
        "a.link._genre_title_a"
      ),
      hasNextPage: false
    };
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

  getSearchFilters(filters) {
    const selected = {
      genre: "fantasy",
      sort: "MANA"
    };

    const filterList = Array.isArray(filters)
      ? filters
      : Array.isArray(filters?.filters)
        ? filters.filters
        : [];

    for (const filter of filterList) {
      if (!filter || filter.type_name !== "SelectFilter") {
        continue;
      }

      const value = this.getSelectedValue(filter);

      if (filter.name === "Género" && value) {
        selected.genre = value;
      }

      if (filter.name === "Ordenar por" && value) {
        selected.sort = value;
      }
    }

    return selected;
  }

  async search(query, page, filters) {
    const keyword = (query || "").trim();

    if (keyword) {
      const url =
        this.baseUrl +
        "/es/search?keyword=" +
        encodeURIComponent(keyword) +
        "&page=" +
        page;

      const doc = await this.fetchDocument(url);

      const list = this.parseCards(
        doc,
        "a.link._card_item"
      );

      return {
        list,
        hasNextPage:
          list.length > 0 &&
          doc.select(
            "a[href*='page=" + (page + 1) + "']"
          ).length > 0
      };
    }

    if (page > 1) {
      return {
        list: [],
        hasNextPage: false
      };
    }

    const selected = this.getSearchFilters(filters);

    const doc = await this.fetchDocument(
      this.buildGenreUrl(
        selected.genre,
        selected.sort
      )
    );

    return {
      list: this.parseCards(
        doc,
        "a.link._genre_title_a"
      ),
      hasNextPage: false
    };
  }

  getMeta(doc, property) {
    const element = doc.selectFirst(
      'meta[property="' + property + '"]'
    );

    return element
      ? this.getAttribute(element, "content")
      : "";
  }

  parseEpisodes(doc, seen) {
    const episodes = [];

    let anchors = doc.select("a.detail_list_link");

    if (!anchors || anchors.length === 0) {
      anchors = doc.select('a[href*="/viewer?"]');
    }

    for (const anchor of anchors) {
      const link = this.getLink(anchor);

      if (!link || !link.includes("/viewer?")) {
        continue;
      }

      if (seen.has(link)) continue;

      const parent = anchor.parent;

      const locked = parent && (
        parent.selectFirst(".detail_paywall") ||
        parent.selectFirst(".ico_lock") ||
        parent.selectFirst(".locked")
      );

      if (locked) continue;

      const titleElement =
        anchor.selectFirst(".subj") ||
        anchor.selectFirst(".sub_title") ||
        anchor.selectFirst(".title");

      let name = titleElement
        ? this.cleanText(titleElement.text)
        : "";

      if (!name) {
        const episodeNumber = link.match(
          /episode_no=(\d+)/
        );

        name = episodeNumber
          ? "Episodio " + episodeNumber[1]
          : "Episodio";
      }

      seen.add(link);

      episodes.push({
        name,
        url: link,
        dateUpload: ""
      });
    }

    return episodes;
  }

  async getDetail(url) {
    const seriesUrl = this.absoluteUrl(url);
    const doc = await this.fetchDocument(seriesUrl);

    const title =
      this.getMeta(doc, "og:title") ||
      this.cleanText(
        doc.selectFirst("h1.subj")?.text ||
        doc.selectFirst("h3.subj")?.text ||
        ""
      );

    const description =
      this.getMeta(doc, "og:description") ||
      this.cleanText(
        doc.selectFirst("p.summary")?.text || ""
      );

    const imageUrl = this.getMeta(doc, "og:image");

    const authorElement =
      doc.selectFirst(".author_area") ||
      doc.selectFirst(".author");

    const author = authorElement
      ? this.cleanText(authorElement.text)
      : "";

    const genre = [];

    for (const element of doc.select(
      "h2.genre, p.genre"
    )) {
      const value = this.cleanText(element.text);

      if (value && !genre.includes(value)) {
        genre.push(value);
      }
    }

    // Conservar la extracción de episodios
    // que funcionó en la versión 0.1.2.
    const seen = new Set();
    const episodes = this.parseEpisodes(doc, seen);

    return {
      name: title,
      title,
      link: seriesUrl,
      imageUrl,
      description,
      author,
      genre,
      status: -1,
      episodes,
      chapters: episodes
    };
  }

  async getPageList(url) {
    const doc = await this.fetchDocument(
      this.absoluteUrl(url)
    );

    const images = [];
    const seen = new Set();

    for (const element of doc.select(
      "#_imageList img._images"
    )) {
      const imageUrl = this.absoluteUrl(
        element.attr("data-url") || ""
      );

      if (!imageUrl || seen.has(imageUrl)) {
        continue;
      }

      seen.add(imageUrl);
      images.push(imageUrl);
    }

    return images;
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
      select("Género", WEBTOON_GENRES, 3),
      select("Ordenar por", WEBTOON_SORT_OPTIONS, 0)
    ];
  }
}
