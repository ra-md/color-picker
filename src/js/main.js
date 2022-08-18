import colorConvert from "color-convert";

const dropzone = document.querySelector(".dropzone");
const inputFile = document.getElementById("input-file");
const inputText = document.getElementById("input-text");
const urlSubmit = document.getElementById("url-submit");

const canvasArea = document.querySelector(".canvas-area");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

const crosshairs = document.querySelector(".crosshairs");
const loading = document.querySelector(".loading");
const errorElement = document.querySelector(".error");

let move = false;

canvasArea.addEventListener("mousedown", () => {
   move = true;
});

canvasArea.addEventListener("mousemove", (event) => {
   if (move === true) {
      moveMouseCrosshairs(event);
   }
});

canvasArea.addEventListener("mouseup", (event) => {
   moveMouseCrosshairs(event);
   move = false;
});

document.addEventListener("mouseup", () => {
   move = false;
});

canvasArea.addEventListener("touchstart", () => {
   move = true;
});

canvasArea.addEventListener("touchmove", (event) => {
   if (move) {
      moveTouchCrosshairs(event);
      document.body.style.overflow = "hidden";
   }
});

canvasArea.addEventListener("touchend", () => {
   document.body.style.overflow = "auto";
});

dropzone.addEventListener("dragover", (e) => {
   e.preventDefault();
});

dropzone.addEventListener("drop", async (e) => {
   e.preventDefault();

   if (e.dataTransfer.files[0]) {
      const image = await readFile(e.dataTransfer.files[0]);
      canvasDrawImage(myCanvas, ctx, await createHTMLImageElement(image));
   } else {
      try {
         const imgElement = await createHTMLImageElement(
            e.dataTransfer.getData("text")
         );
         canvasDrawImage(myCanvas, ctx, imgElement);
      } catch (_) {
         removeLoading();
         showErrorMessage("Access has been blocked by CORS");
      }
   }
});

inputFile.addEventListener("change", async () => {
   try {
      const image = await readFile(inputFile.files[0]);
      canvasDrawImage(myCanvas, ctx, await createHTMLImageElement(image));
   } catch (error) {
      showErrorMessage(error);
      removeLoading();
   }
});

urlSubmit.addEventListener("click", async () => {
   try {
      canvasDrawImage(
         myCanvas,
         ctx,
         await createHTMLImageElement(inputText.value)
      );
   } catch (error) {
      showErrorMessage(error);
      removeLoading();
   }
});

function showLoading() {
   loading.style.visibility = "visible";
}

function removeLoading() {
   loading.style.visibility = "hidden";
}

function showErrorMessage(message) {
   errorElement.innerHTML = message;
   errorElement.style.display = "block";
}

function removeErrorMessage() {
   errorElement.style.display = "none";
}

function showColorPicker() {
   document.querySelector(".color-picker").style.display = "grid";
   document.querySelector(".colors").style.display = "grid";

   window.scrollTo(
      0,
      document.body.scrollHeight || document.documentElement.scrollHeight
   );
}

function readFile(imgData) {
   const oFReader = new FileReader();

   if (imgData) {
      oFReader.readAsDataURL(imgData);
   }

   return new Promise((resolve) => {
      oFReader.onload = (oFREvent) => {
         resolve(oFREvent.target.result);
      };
   });
}

function createHTMLImageElement(imgUrl) {
   const img = new Image();
   img.crossOrigin = "Anonymous";
   img.src = imgUrl;

   showLoading();

   return new Promise((resolve, reject) => {
      img.onload = () => {
         showColorPicker();
         removeErrorMessage();
         resolve(img);
      };

      img.onerror = () => {
         reject("You can't upload files of this type");
      };
   });
}

function canvasDrawImage(canvas, context, img) {
   if (img.naturalWidth < window.innerWidth) {
      const w = (canvas.width = img.naturalWidth);
      const h = (canvas.height = img.naturalHeight);

      canvasArea.style.width = `${w}px`;
      canvasArea.style.height = `${h}px`;

      context.drawImage(img, 0, 0);
   } else if (window.innerWidth < 768) {
      const w = Math.floor(window.innerWidth - 20);
      const h = Math.floor((w * img.naturalHeight) / img.naturalWidth);

      canvasArea.style.width = `${w}px`;
      canvasArea.style.height = `${h}px`;

      canvas.width = w;
      canvas.height = h;
      context.drawImage(img, 0, 0, w, h);
   } else {
      const w = window.innerWidth / 1.8;
      const h = (w * img.naturalHeight) / img.naturalWidth;

      canvasArea.style.width = `${w}px`;
      canvasArea.style.height = `${h}px`;

      canvas.width = w;
      canvas.height = h;
      context.drawImage(img, 0, 0, w, h);
   }

   removeLoading();
}

function getRGBColor(context, x, y) {
   const color = context.getImageData(x, y, 1, 1);
   return [color.data[0], color.data[1], color.data[2]];
}

function rgbToHex(rgb) {
   return colorConvert.rgb.hex(rgb);
}

function rgbToCmyk(rgb) {
   return colorConvert.rgb.cmyk(rgb);
}

function rgbToHsv(rgb) {
   return colorConvert.rgb.hsv(rgb);
}

function rgbToHsl(rgb) {
   return colorConvert.rgb.hsl(rgb);
}

function setColors(rgb) {
   document.getElementById("color-input-rgb").value = rgb;

   document.getElementById("color-input-hex").value = `#${rgbToHex(rgb)}`;

   document.getElementById("color-input-cmyk").value = `${
      rgbToCmyk(rgb)[0]
   }%, ${rgbToCmyk(rgb)[1]}%, ${rgbToCmyk(rgb)[2]}%, ${rgbToCmyk(rgb)[3]}%`;

   document.getElementById("color-input-hsv").value = `${rgbToHsv(rgb)[0]}°, ${
      rgbToHsv(rgb)[1]
   }%, ${rgbToHsv(rgb)[2]}%`;

   document.getElementById("color-input-hsl").value = `${rgbToHsl(rgb)[0]}°, ${
      rgbToHsl(rgb)[1]
   }%, ${rgbToHsl(rgb)[2]}%`;
}

function moveCrosshairs(x, y) {
   crosshairs.style.transform = `translate(${x}px, ${y}px)`;
}

function changeCrosshairsColor(crosshairs, rgb) {
   if (rgbToHsl(rgb)[2] < 50) {
      crosshairs.style.filter = "invert(1)";
   } else {
      crosshairs.style.filter = "invert(0)";
   }
}

function moveTouchCrosshairs(event) {
   const brc = event.target.getBoundingClientRect();
   const x = event.changedTouches[0].clientX - 9;
   const y = event.changedTouches[0].clientY - brc.y;

   const rgbColor = getRGBColor(ctx, x, y);

   changeCrosshairsColor(crosshairs, rgbColor);

   moveCrosshairs(x - 21, y - 20);
   document.querySelector(
      "body"
   ).style.background = `rgb(${rgbColor.toString()})`;
}

function moveMouseCrosshairs(event) {
   moveCrosshairs(event.offsetX - 20, event.offsetY - 20);

   const rgbColor = getRGBColor(ctx, event.layerX, event.layerY);

   setColors(rgbColor);

   changeCrosshairsColor(crosshairs, rgbColor);

   document.querySelector(
      "body"
   ).style.background = `rgb(${rgbColor.toString()})`;
}
