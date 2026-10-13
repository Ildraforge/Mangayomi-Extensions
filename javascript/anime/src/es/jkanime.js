
const mangayomiSources = [
  {
    name: "JKAnime",
    lang: "es",
    baseUrl: "https://jkanime.net",
    iconUrl: "https://cdn.jkdesa.com/assets3/css/img/favicon.ico",
    typeSource: "single",
    itemType: 1,
    version: "0.1.0",
    pkgPath: "anime/src/es/jkanime.js",
    notes: "Anime subtitulado en español. Reproducción HLS experimental.",
    isNsfw: false
  }
];

class DefaultExtension extends MProvider {
  getHeaders(url) {
    return {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://jkanime.net/",
      "Accept": "text/html,application/xhtml+xml,*/*"
    };
  }

  async fetchHtml(url) {
    const response = await new Client().get(url, this.getHeaders(url));

    if (!response || response.statusCode !== 200) {
      throw new Error("JKAnime: error HTTP " + (response && response.statusCode));
    }

    return response.body || "";
  }

  decodeHtml(value) {
    return String(value || "")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&#x27;/gi, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/<[^>]*>/g, "")
      .trim();
  }

  absoluteUrl(value) {
    const url = String(value || "").trim();
    if (/^https?:\/\//i.test(url)) return url;
    return "https://jkanime.net/" + url.replace(/^\/+/, "");
  }

  animeUrl(episodeUrl) {
    const match = String(episodeUrl).match(
      /^(https?:\/\/[^/]+\/[^/?#]+\/)(?:\d+\/?)?(?:\?.*)?$/
    );
    return match ? match[1] : episodeUrl;
  }

  parseAnimeCards(html) {
    const list = [];
    const seen = new Set();

    const pattern = /<div[^>]*class="[^"]*\banime__item\b[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*\banime__item\b|$)/gi;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      const block = match[1];

      const titleMatch = block.match(
        /<h5[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
      );

      const imageMatch = block.match(
        /data-setbg="([^"]+)"/i
      );

      if (!titleMatch) continue;

      const link = this.absoluteUrl(titleMatch[1]);
      if (seen.has(link)) continue;
      seen.add(link);

      list.push({
        name: this.decodeHtml(titleMatch[2]),
        link: link,
        imageUrl: imageMatch ? this.decodeHtml(imageMatch[1]) : ""
      });
    }

    return list;
  }

  parseRecentCards(html) {
    const list = [];
    const seen = new Set();

    const pattern = /<div class="card ml-2 mr-2">([\s\S]*?)<\/a><\/div>/gi;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      const block = match[1];
      const linkMatch = block.match(/<a[^>]*href="([^"]+)"/i);
      const titleMatch = block.match(
        /<h5[^>]*class="[^"]*card-title[^"]*"[^>]*>([\s\S]*?)<\/h5>/i
      );
      const imageMatch = block.match(/data-animepic="([^"]+)"/i);

      if (!linkMatch || !titleMatch) continue;

      const link = this.animeUrl(this.absoluteUrl(linkMatch[1]));
      if (seen.has(link)) continue;
      seen.add(link);

      list.push({
        name: this.decodeHtml(titleMatch[1]),
        link: link,
        imageUrl: imageMatch ? this.decodeHtml(imageMatch[1]) : ""
      });
    }

    return list;
  }

  async getPopular(page) {
    if (Number(page) > 1) {
      return { list: [], hasNextPage: false };
    }

    const html = await this.fetchHtml("https://jkanime.net/");
    const list = this.parseRecentCards(html);

    return { list, hasNextPage: false };
  }

  async getLatestUpdates(page) {
    return this.getPopular(page);
  }

  async search(query, page, filters) {
    const url = "https://jkanime.net/buscar?q=" +
      encodeURIComponent(String(query || ""));

    const target = Number(page) > 1
      ? url + "&page=" + Number(page)
      : url;

    const html = await this.fetchHtml(target);
    const list = this.parseAnimeCards(html);

    return {
      list,
      hasNextPage: list.length > 0 &&
        /(?:[?&]page=|rel="next")/i.test(html)
    };
  }

  async getDetail(url) {
    const link = this.absoluteUrl(url);
    const html = await this.fetchHtml(link);

    const titleMatch = html.match(
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i
    );
    const imageMatch = html.match(
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i
    );
    const descriptionMatch = html.match(
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i
    );

    const idMatch = html.match(/\/ajax\/episodes\/(\d+)\//i);
    const csrfMatch = html.match(
      /<meta[^>]*name="csrf-token"[^>]*content="([^"]+)"/i
    );

    const name = titleMatch
      ? this.decodeHtml(titleMatch[1])
      : link.split("/").filter(Boolean).pop();

    const episodes = [];

    if (idMatch && csrfMatch) {
      const id = idMatch[1];
      const token = csrfMatch[1];
      const client = new Client();

      const headers = {
        ...this.getHeaders(link),
        "Referer": link,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      };

      let total = 0;

      for (let page = 1; page <= 150; page++) {
        const response = await client.post(
          "https://jkanime.net/ajax/episodes/" + id + "/" + page,
          headers,
          "_token=" + encodeURIComponent(token)
        );

        if (!response || response.statusCode !== 200) break;

        let json;
        try {
          json = JSON.parse(response.body);
        } catch (_) {
          break;
        }

        const data = Array.isArray(json.data) ? json.data : [];
        if (page === 1) total = Number(json.total || 0);
        if (!data.length) break;

        for (const item of data) {
          const number = Number(item.number);
          if (!Number.isFinite(number)) continue;

          episodes.push({
            name: item.title || "Episodio " + number,
            url: link.replace(/\/?$/, "/") + number + "/"
          });
        }

        if (total && episodes.length >= total) break;
        if (data.length < 16) break;
      }
    }

    return {
      name,
      link,
      imageUrl: imageMatch ? this.decodeHtml(imageMatch[1]) : "",
      description: descriptionMatch
        ? this.decodeHtml(descriptionMatch[1])
        : "",
      status: 5,
      genre: [],
      episodes
    };
  }

  async getVideoList(url) {
    const episodeUrl = this.absoluteUrl(url);
    const html = await this.fetchHtml(episodeUrl);

    const iframeMatch = html.match(
      /https?:\/\/jkanime\.net\/jkplayer\/umv\?[^"'\\\s<>]+/i
    );

    if (!iframeMatch) {
      throw new Error("JKAnime: no se encontró el reproductor Magi.");
    }

    const playerUrl = iframeMatch[0].replace(/&amp;/g, "&");

    const response = await new Client().get(playerUrl, {
      ...this.getHeaders(playerUrl),
      Referer: episodeUrl
    });

    if (!response || response.statusCode !== 200) {
      throw new Error("JKAnime: no se pudo abrir Magi.");
    }

    const playerHtml = response.body || "";

    const streamMatch = playerHtml.match(
      /https?:\/\/[^"'\\\s<>]+\.m3u8(?:\?[^"'\\\s<>]*)?/i
    );

    if (!streamMatch) {
      throw new Error("JKAnime: Magi no devolvió un enlace HLS.");
    }

    const streamUrl = streamMatch[0].replace(/&amp;/g, "&");

    return [
      {
        url: streamUrl,
        originalUrl: streamUrl,
        quality: "HLS",
        headers: {
          Referer: "https://jkanime.net/",
          "User-Agent": "Mozilla/5.0"
        }
      }
    ];
  }

  async getPageList() {
    return [];
  }

  getFilterList() {
    return [];
  }
}
