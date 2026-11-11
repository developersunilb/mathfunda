import { getFontEmbedCSS, toJpeg } from "html-to-image";
import JSZip from "jszip";
import { paginateChapter } from "./paginate.js";

/*
  Fixed-layout EPUB 3 exporter.

  The app already knows how to lay out a printable workbook. This module turns
  that same content into discrete A4 pages, captures each page as a high
  resolution image, and wraps the images in a standards-based fixed-layout
  EPUB. Apple Books (iPad 8 and later) and other EPUB 3 readers can open it.

  Why images: the pages contain KaTeX formulas, coloured callout boxes and
  tables. Rendering each finished page avoids reflow and keeps the design
  identical to the PDF.
*/

const PAGE_WIDTH = 794; // A4 at 96 dpi
const PAGE_HEIGHT = 1123;
const MARGIN_TOP = 53;
const MARGIN_RIGHT = 57;
const MARGIN_BOTTOM = 64;
const MARGIN_LEFT = 57;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
const PIXEL_RATIO = 1.6;
const JPEG_QUALITY = 0.82;

/* --------------------------------------------------------------- Utilities */

function escapeXml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]
  );
}

function pad(number) {
  return String(number).padStart(3, "0");
}

function dataUrlToBlob(dataUrl) {
  const [header, payload] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/* ------------------------------------------------------------ Page builder */

class BookBuilder {
  constructor(host, bookTitle) {
    this.host = host;
    this.bookTitle = bookTitle;
    this.pages = [];
    this.current = null;
  }

  addPage({ chapterTitle = "", label = "", showLabel = false, cover = false } = {}) {
    const page = document.createElement("div");
    page.className = "epub-page";
    if (cover) page.classList.add("epub-page-cover");

    const body = document.createElement("div");
    body.className = "epub-page-body document-content";

    const footer = document.createElement("div");
    footer.className = "epub-page-footer";

    const footerTitle = document.createElement("span");
    footerTitle.className = "epub-page-footer-title";
    footerTitle.textContent = chapterTitle || this.bookTitle;

    const footerNumber = document.createElement("span");
    footerNumber.className = "epub-page-number";

    footer.append(footerTitle, footerNumber);
    page.append(body, footer);

    if (showLabel) {
      const labelElement = document.createElement("div");
      labelElement.className = "epub-chapter-label";
      const kicker = document.createElement("span");
      kicker.textContent = label;
      const title = document.createElement("strong");
      title.textContent = chapterTitle;
      labelElement.append(kicker, title);
      body.appendChild(labelElement);
    }

    this.host.appendChild(page);

    const entry = {
      page,
      body,
      footer,
      footerNumber,
      chapterTitle,
      cover,
    };
    this.pages.push(entry);
    this.current = entry;
    return entry;
  }

  get contentWidth() {
    return CONTENT_WIDTH;
  }

  get pageHeight() {
    return CONTENT_HEIGHT;
  }

  fits() {
    return this.current.body.scrollHeight <= this.pageHeight + 1;
  }

  hasContent() {
    return (
      this.current.body.querySelector(":scope > :not(.epub-chapter-label)") !== null
    );
  }

  breakPage(options = {}) {
    return this.addPage({
      chapterTitle: options.chapterTitle ?? this.current.chapterTitle,
    });
  }
}

/* ------------------------------------------------------- Cover & contents */

function buildCover(builder, meta) {
  const page = builder.addPage({ cover: true });
  page.body.classList.add("epub-cover-body");

  const cover = document.createElement("div");
  cover.className = "epub-cover";
  cover.innerHTML = `
    <div class="epub-cover-mark">∑</div>
    <p class="epub-cover-kicker">${escapeXml(meta.coverKicker)}</p>
    <h1>${escapeXml(meta.title)}</h1>
    <p class="epub-cover-sub">${escapeXml(meta.subtitle || "")}</p>
    <div class="epub-cover-rule"></div>
    <p class="epub-cover-note">Fixed-layout edition · Apple Books</p>
  `;

  page.body.appendChild(cover);
  page.footer.style.visibility = "hidden";
}

function buildContents(builder, chapters, meta) {
  builder.addPage({ chapterTitle: "" });

  const intro = document.createElement("div");
  intro.className = "epub-contents-head";
  intro.innerHTML = `
    <p class="epub-contents-kicker">${escapeXml(meta.kicker)}</p>
    <h1>${escapeXml(meta.heading)}</h1>
    <p class="epub-contents-copy">${escapeXml(meta.copy)}</p>
  `;
  builder.current.body.appendChild(intro);

  let list = null;
  const entries = [];

  const ensureList = () => {
    if (!list) {
      list = document.createElement("ol");
      list.className = "epub-toc";
      builder.current.body.appendChild(list);
    }
  };

  chapters.forEach((chapter, index) => {
    ensureList();

    const item = document.createElement("li");
    item.innerHTML = `
      <span class="epub-toc-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="epub-toc-title">${escapeXml(chapter.title)}</span>
      <span class="epub-toc-page">&nbsp;</span>
    `;
    const pageNumber = item.querySelector(".epub-toc-page");
    list.appendChild(item);

    if (!builder.fits()) {
      list.removeChild(item);
      if (list.children.length > 0) {
        builder.breakPage();
        list = null;
        ensureList();
        list.appendChild(item);
      }
    }

    entries.push({ chapter, pageNumber });
  });

  return entries;
}

/* ------------------------------------------------------------- EPUB output */

const BOOK_CSS = `html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
}
body {
  width: ${PAGE_WIDTH}px;
  height: ${PAGE_HEIGHT}px;
  overflow: hidden;
}
img.page-image {
  display: block;
  width: ${PAGE_WIDTH}px;
  height: ${PAGE_HEIGHT}px;
}`;

function pageXhtml(index, title) {
  const name = pad(index);
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeXml(title || `Page ${index}`)}</title>
    <meta name="viewport" content="width=${PAGE_WIDTH}, height=${PAGE_HEIGHT}" />
    <link rel="stylesheet" type="text/css" href="../css/book.css" />
  </head>
  <body>
    <img class="page-image" src="../images/page-${name}.jpg" alt="${escapeXml(
      title || `Page ${index}`
    )}" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" />
  </body>
</html>
`;
}

function buildOpf({ title, identifier, modified, pageCount, chapterTargets }) {
  const manifestPages = Array.from({ length: pageCount }, (_, i) => {
    const name = pad(i + 1);
    return `    <item id="page-${name}" href="pages/page-${name}.xhtml" media-type="application/xhtml+xml" />`;
  }).join("\n");

  const manifestImages = Array.from({ length: pageCount }, (_, i) => {
    const name = pad(i + 1);
    const coverProperty = i === 0 ? ' properties="cover-image"' : "";
    return `    <item id="image-${name}" href="images/page-${name}.jpg" media-type="image/jpeg"${coverProperty} />`;
  }).join("\n");

  const spine = Array.from({ length: pageCount }, (_, i) => {
    const name = pad(i + 1);
    const properties = i === 0 ? ' properties="rendition:page-spread-center"' : "";
    return `    <itemref idref="page-${name}"${properties} />`;
  }).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" prefix="rendition: http://www.idpf.org/vocab/rendition/#">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${escapeXml(identifier)}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>CBSE Maths Notes Studio</dc:creator>
    <meta property="dcterms:modified">${modified}</meta>
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">landscape</meta>
    <meta property="rendition:spread">landscape</meta>
    <meta property="rendition:flow">paginated</meta>
    <meta name="cover" content="image-001" />
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="css" href="css/book.css" media-type="text/css" />
${manifestPages}
${manifestImages}
  </manifest>
  <spine>
${spine}
  </spine>
</package>
`;
}

function buildNav({ title, chapters, chapterTargets }) {
  const items = chapters
    .map((chapter, index) => {
      const target = chapterTargets[index];
      return `      <li><a href="pages/page-${pad(target)}.xhtml">${escapeXml(
        chapter.title
      )}</a></li>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeXml(title)}</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Contents</h1>
      <ol>
${items}
      </ol>
    </nav>
  </body>
</html>
`;
}

const CONTAINER_XML = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>
`;

const APPLE_DISPLAY_OPTIONS = `<?xml version="1.0" encoding="UTF-8"?>
<display_options>
  <platform name="*">
    <option name="fixed-layout">true</option>
    <option name="open-to-spread">true</option>
    <option name="orientation-lock">landscape</option>
    <option name="specified-fonts">true</option>
  </platform>
</display_options>
`;

/* --------------------------------------------------------------- Exporter */

/**
 * Build and download a fixed-layout EPUB 3 book.
 *
 * @param {object} options
 * @param {Array<{title: string, html: string}>} options.chapters Rendered chapters.
 * @param {object} options.meta Cover, contents and file naming text.
 * @param {(progress: {message: string, ratio: number}) => void} [options.onProgress]
 */
export async function exportEpub({ chapters, meta, onProgress }) {
  if (!chapters.length) throw new Error("No chapters selected.");

  const host = document.createElement("div");
  host.className = "epub-book";
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);

  try {
    onProgress?.({ message: "Laying out pages…", ratio: 0.02 });

    const builder = new BookBuilder(host, meta.title);
    buildCover(builder, meta);
    const contentsEntries =
      chapters.length > 1 ? buildContents(builder, chapters, meta) : [];

    const chapterTargets = [];
    const labels = meta.labels || [];

    for (let index = 0; index < chapters.length; index += 1) {
      const chapter = chapters[index];
      const label =
        labels[index] ||
        `${meta.labelPrefix || "CHAPTER"} ${index + 1}`;
      chapterTargets.push(paginateChapter(builder, chapter, label) + 1);
      await nextTick();
    }

    for (let index = 0; index < builder.pages.length; index += 1) {
      builder.pages[index].footerNumber.textContent = String(index + 1);
    }

    contentsEntries.forEach((entry, index) => {
      entry.pageNumber.textContent = String(chapterTargets[index]);
      entry.pageNumber.removeAttribute("data-placeholder");
    });

    await nextTick();

    onProgress?.({ message: "Embedding fonts…", ratio: 0.08 });

    let fontEmbedCSS = "";
    try {
      fontEmbedCSS = await getFontEmbedCSS(builder.pages[0].page);
    } catch (error) {
      console.warn("Could not embed fonts for the EPUB; using system fallbacks.", error);
    }

    const images = [];
    for (let index = 0; index < builder.pages.length; index += 1) {
      const ratio = 0.1 + (index / builder.pages.length) * 0.72;
      onProgress?.({
        message: `Rendering page ${index + 1} of ${builder.pages.length}…`,
        ratio,
      });

      const dataUrl = await toJpeg(builder.pages[index].page, {
        pixelRatio: PIXEL_RATIO,
        quality: JPEG_QUALITY,
        fontEmbedCSS,
      });
      images.push(dataUrlToBlob(dataUrl));
      await nextTick();
    }

    onProgress?.({ message: "Packaging the EPUB…", ratio: 0.86 });

    const pageCount = builder.pages.length;
    const identifier = `urn:uuid:${crypto.randomUUID()}`;
    const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const bookTitle = meta.title;

    const zip = new JSZip();
    // The mimetype entry must be first and stored without compression.
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", CONTAINER_XML);
    zip.file("META-INF/com.apple.ibooks.display-options.xml", APPLE_DISPLAY_OPTIONS);

    const oebps = zip.folder("OEBPS");
    oebps.file("content.opf", buildOpf({ title: bookTitle, identifier, modified, pageCount }));
    oebps.file("nav.xhtml", buildNav({ title: bookTitle, chapters, chapterTargets }));
    oebps.file("css/book.css", BOOK_CSS);

    const pagesFolder = oebps.folder("pages");
    const imagesFolder = oebps.folder("images");

    for (let index = 0; index < pageCount; index += 1) {
      const name = pad(index + 1);
      const title =
        index === 0 ? meta.title : chapters.find((_, chapterIndex) => {
          const next = chapterTargets[chapterIndex + 1];
          const start = chapterTargets[chapterIndex];
          const absolute = index + 1;
          return absolute >= start && (next === undefined || absolute < next);
        })?.title;
      pagesFolder.file(`page-${name}.xhtml`, pageXhtml(index + 1, title));
      imagesFolder.file(`page-${name}.jpg`, images[index]);
    }

    const bookBlob = await zip.generateAsync(
      {
        type: "blob",
        mimeType: "application/epub+zip",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      },
      ({ percent }) => {
        onProgress?.({
          message: `Packaging the EPUB… ${Math.round(percent)}%`,
          ratio: 0.86 + (percent / 100) * 0.12,
        });
      }
    );

    onProgress?.({ message: "Saving the EPUB…", ratio: 0.99 });

    const url = URL.createObjectURL(bookBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = meta.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    onProgress?.({ message: "EPUB ready.", ratio: 1 });

    return { pages: pageCount, bytes: bookBlob.size };
  } finally {
    host.remove();
  }
}
