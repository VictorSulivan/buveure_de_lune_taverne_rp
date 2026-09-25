import { toPng } from "html-to-image";

function telechargerDataUrl(dataUrl: string, filename: string) {
  const lien = document.createElement("a");
  lien.href = dataUrl;
  lien.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
}

function attendreDeuxFrames() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function telechargerParchemin(element: HTMLElement, filename: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const largeur = Math.max(element.scrollWidth, element.offsetWidth);
  const hauteur = Math.max(element.scrollHeight, element.offsetHeight);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${largeur}px`;
  clone.style.maxWidth = `${largeur}px`;
  clone.style.position = "fixed";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.zIndex = "2147483646";
  clone.style.margin = "0";
  document.body.appendChild(clone);
  await attendreDeuxFrames();

  try {
    const dataUrl = await toPng(clone, {
      pixelRatio: 2,
      cacheBust: true,
      width: Math.max(clone.scrollWidth, largeur),
      height: Math.max(clone.scrollHeight, hauteur),
      backgroundColor: "#f3e2b8",
      style: {
        transform: "none",
      },
    });

    if (!dataUrl || dataUrl.length < 1000) {
      throw new Error("La capture du parchemin est vide");
    }

    telechargerDataUrl(dataUrl, filename);
  } finally {
    clone.remove();
  }
}
