
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
    version: "0.1.0",
    dateFormat: "",
    dateFormatLocale: "",
    pkgPath: "manga/src/es/webtoon.js",
    notes: "WEBTOON Español. Versión experimental."
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
      element.attr("href") || element.getHref || ""
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
      if (!link || !link.includes("title_no=")) continue;
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

  async getPopular(page) {
    if (page > 1) {
      return {
        list: [],
        hasNextPage: false
      };
    }

    const url =
      this.baseUrl +
      "/es/genres/fantasy?sortOrder=MANA";

    const doc = await this.fetchDocument(url);

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

    const url =
      this.baseUrl +
      "/es/genres/fantasy?sortOrder=UPDATE";

    const doc = await this.fetchDocument(url);

    return {
      list: this.parseCards(
        doc,
        "a.link._genre_title_a"
      ),
      hasNextPage: false
    };
  }

  async search(query, page, filters) {
    const keyword = (query || "").trim();

    if (!keyword) {
      return this.getPopular(page);
    }

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
      hasNextPage: list.length > 0 &&
        doc.select("a[href*='page=" + (page + 1) + "']").length > 0
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

  parseEpisodeDate(element) {
    const dateElement =
      element.selectFirst(".date") ||
      element.selectFirst(".date_area");

    if (!dateElement) return "";

    return this.cleanText(dateElement.text);
  }

  parseEpisodes(doc, seen) {
    const episodes = [];

    for (const element of doc.select(
      "li._episodeItem.detail_list_item"
    )) {
      const anchor =
        element.selectFirst("a.detail_list_link") ||
        element.selectFirst("a");

      if (!anchor) continue;

      const link = this.getLink(anchor);

      if (!link || !link.includes("/viewer?")) {
        continue;
      }

      if (seen.has(link)) continue;

      // No incluir episodios que se anuncien como
      // bloqueados o exclusivos de la aplicación.
      const locked =
        element.selectFirst(".detail_paywall") ||
        element.selectFirst(".ico_lock") ||
        element.selectFirst(".locked");

      if (locked) continue;

      const titleElement =
        element.selectFirst(".subj") ||
        element.selectFirst(".sub_title") ||
        element.selectFirst(".title");

      let name = titleElement
        ? this.cleanText(titleElement.text)
        : "";

      if (!name) {
        name = this.cleanText(anchor.text);
      }

      if (!name) {
        const match = link.match(/episode_no=(\d+)/);
        name = match
          ? "Episodio " + match[1]
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

    const imageUrl =
      this.getMeta(doc, "og:image");

    const authorElement =
      doc.selectFirst(".author_area") ||
      doc.selectFirst(".author");

    const author = authorElement
      ? this.cleanText(authorElement.text)
      : "";

    const genreElements = doc.select(
      "h2.genre, p.genre"
    );

    const genre = [];

    for (const element of genreElements) {
      const value = this.cleanText(element.text);
      if (value && !genre.includes(value)) {
        genre.push(value);
      }
    }

    const seen = new Set();
    const episodes = [];

    // WEBTOON divide los episodios en páginas.
    // Se detiene cuando una página no devuelve
    // episodios nuevos.
    for (let page = 1; page <= 100; page++) {
      let pageDoc;

      if (page === 1) {
        pageDoc = doc;
      } else {
        const separator = seriesUrl.includes("?")
          ? "&"
          : "?";

        const pageUrl =
          seriesUrl +
          separator +
          "page=" +
          page;

        pageDoc = await this.fetchDocument(pageUrl);
      }

      const newEpisodes =
        this.parseEpisodes(pageDoc, seen);

      if (newEpisodes.length === 0) break;

      episodes.push(...newEpisodes);

      if (newEpisodes.length < 9) break;
    }

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
    return [];
  }
}
