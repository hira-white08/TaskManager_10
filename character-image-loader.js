(() => {
  const originalSetAttribute = Element.prototype.setAttribute;

  function resolveCharacterImageSource(value) {
    const source = String(value);
    const match = source.match(/(?:^|\/)character([1-5])\.png(?:$|\?)/);

    if (!match) {
      return value;
    }

    return "images/" + match[1] + ".png";
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

    const currentSource = characterImage.getAttribute("src") || "images/2.png";
    characterImage.setAttribute("src", currentSource);
  });
})();
