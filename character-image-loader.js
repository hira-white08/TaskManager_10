(() => {
  const originalSetAttribute = Element.prototype.setAttribute;

  function resolveCharacterImageSource(value) {
    const source = String(value);
    const match = source.match(/(?:^|\/)character([1-5])\.png(?:$|\?)/);

    if (!match || !window.CHARACTER_IMAGE_DATA_URLS) {
      return value;
    }

    return window.CHARACTER_IMAGE_DATA_URLS[match[1]] || value;
  }

  Element.prototype.setAttribute = function setAttributeWithCharacterImageMap(name, value) {
    if (this instanceof HTMLImageElement && String(name).toLowerCase() === "src") {
      return originalSetAttribute.call(this, name, resolveCharacterImageSource(value));
    }

    return originalSetAttribute.call(this, name, value);
  };

  window.addEventListener("DOMContentLoaded", () => {
    const characterImage = document.getElementById("character-image");
    if (!characterImage) return;

    const currentSource = characterImage.getAttribute("src") || "images/character2.png";
    characterImage.setAttribute("src", currentSource);
  });
})();
